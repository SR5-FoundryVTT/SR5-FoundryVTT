import {SR5Actor} from './actor/SR5Actor';
import {SR5Item} from './item/SR5Item';
import {CORE_FLAGS, CORE_NAME, FLAGS, SYSTEM_NAME} from './constants';
import {ShadowrunRoll, Test} from "./rolls/ShadowrunRoller";
import {Helpers} from "./helpers";
import {DamageApplicationFlow} from './actor/flows/DamageApplicationFlow';
import AttackData = Shadowrun.AttackData;
import DrainData = Shadowrun.DrainData;
import ModifiedDamageData = Shadowrun.ModifiedDamageData;
import DamageType = Shadowrun.DamageType;
import DamageElement = Shadowrun.DamageElement;
import CombatData = Shadowrun.CombatData;
import ActionResultData = Shadowrun.ActionResultData;
import {ActionTestData} from "./apps/dialogs/ShadowrunItemDialog";
import {ActionResultFlow} from "./item/flows/ActionResultFlow";
import { TestCreator } from './tests/TestCreator';

export interface RollTargetChatMessage {
    actor: SR5Actor
    target?: Token | undefined
    targets?: Token[]
    item: SR5Item
    tests: Test[]
    roll: ShadowrunRoll
    attack?: AttackData
    rollMode?: keyof typeof CONFIG.Dice.rollModes
}

export interface TargetChatMessageOptions extends RollTargetChatMessage {
    whisperTo: User
}

// Simple card text messages
export interface ItemChatMessageOptions {
    actor: SR5Actor
    item: SR5Item
    description: object
    tests?: Test[]
}

export interface RollChatMessageOptions {
    title: string
    roll: ShadowrunRoll
    actor?: SR5Actor
    target?: Token
    targets?: Token[]

    item?: SR5Item

    description?: object

    rollMode?: keyof typeof CONFIG.Dice.rollModes
    previewTemplate?: boolean

    attack?: AttackData
    incomingAttack?: AttackData
    incomingDrain?: DrainData
    damage?: ModifiedDamageData
    tests?: Test[]
    combat?: CombatData
    reach?: number
    result?: ActionResultData
    actionData?: ActionTestData
}

interface ItemChatTemplateData {
    title: string
    actor: SR5Actor
    token: TokenDocument|null
    item: SR5Item
    description: object
    tests?: Test[]
}

interface RollChatTemplateData extends RollChatMessageOptions {
    tokenId?: string
    targetTokenId?: string
    rollMode: keyof typeof CONFIG.Dice.rollModes
}

/**
 * The legacy chat message approach of the system uses a generic chat message to display roll and item information.
 *
 * NOTE: This approach has been deprecated in Foundry 0.8 and should be replaced with custom Roll implementation for each kind of Roll (ActionRoll, AttackRoll, OpposedRoll, ...).
 *
 * @param template The dist path to be used as a template file.
 * @param templateData An untyped object carrying data to display. The template should itself check for what properties are available and only renders what's given.
 */
async function createChatMessage(template: string, templateData): Promise<ChatMessage|null> {
    const chatData = await createChatData(template, templateData);
    const message = await ChatMessage.create(chatData);

    if (!message) return null;

    return message;
}

// templateData has no datatype to pipe through whatever it's given.
// Clean up your data within templateData creation functions!
const createChatData = async (template: string, templateData) => {
    const html = await renderTemplate(template, templateData);

    const chatData = {
        user: game.user?.id,
        speaker: {
            actor: templateData.actor?.id,
            token: templateData.token?.id,
            alias: game.user?.name
        },
        item: templateData.item,
        content: html,
        rollMode: game.settings.get(CORE_NAME, CORE_FLAGS.RollMode)
    };

    // @ts-ignore
    ChatMessage.applyRollMode(chatData, chatData.rollMode);

    return chatData;
};

export async function createItemChatMessage(options: ItemChatMessageOptions) {
    const templateData = createChatTemplateData(options);
    return await createChatMessage('systems/shadowrun5e/dist/templates/rolls/item-card.html', templateData);
}

function createChatTemplateData(options: ItemChatMessageOptions): ItemChatTemplateData {
    // field extraction is explicit to enforce visible data flow to ensure clean data.
    // NOTE: As soon as clear data dynamic data flow can be established, this should be removed for a simple {...options}
    let {actor, item, description, tests} = options;

    const token = actor?.getToken();
    const title = game.i18n.localize("SR5.Description");

    return {
        title,
        actor,
        token,
        item,
        description,
        tests
    }
}

/**
 * Return a mixed Scene and Token id data pair, separated by a dot '.'.
 *
 * This is needed for later retrieval of token related data from a chat message, should the scene have been switched after
 * the chat message has been created.
 *
 * TODO: Store the scene id in the chat message data or flag in it's OWN data property instead of a mixed special case.
 *
 * @param token What token the sceneTokenId must be created for.
 * @return '<SceneId>.<TokenId>'
 */
function getTokenSceneId(token: TokenDocument | undefined | null): string | undefined {
    const scene = token?.parent;

    if (!token || !scene) return;
    return `${scene.id}.${token.id}`;
}

export const addRollListeners = (app: ChatMessage, html) => {

    /**
     * Apply action results onto targets or selections.
     */
    html.on('click', '.result', async event => {
        event.stopPropagation();

        const messageId = html.data('messageId');
        const message = game.messages?.get(messageId);

        if (!message) return;

        const actionTestData = message.getFlag(SYSTEM_NAME, FLAGS.ActionTestData) as ActionTestData;

        if (actionTestData.matrix) {
            const sceneTokenId = html.find('.chat-card').data('tokenId');
            const actor = Helpers.getSceneTokenActor(sceneTokenId);

            if (!actor) return console.error('No actor could be extracted from message data.');

            // Allow custom selection for GMs and users with enough permissions.
            // token.actor can be undefined for tokens with removed actors.
            let targets = Helpers.getControlledTokens().filter(token => token.actor?.id !== game.user?.character?.id);

            // For users allow custom selection using targeting.
            if (targets.length === 0) {
                targets = Helpers.getTargetedTokens();
            }
            // For no manual selection fall back to previous message targets.
            if (targets.length === 0) {
                const targetSceneIds = message.getFlag(SYSTEM_NAME, FLAGS.TargetsSceneTokenIds) as string[];

                targetSceneIds.forEach(targetSceneId => {
                    const [sceneId, tokenId] = Helpers.deconstructSceneTokenId(targetSceneId);
                    // @ts-ignore // TODO: Token vs TokenDocument... the workflow here is confusing.
                    targets.push(Helpers.getSceneTokenDocument(sceneId, tokenId));
                })
            }

            if (targets.length === 0) {
                return ui.notifications?.warn(game.i18n.localize("SR5.Warnings.TokenSelectionNeeded"));
            }

            const {marks} = actionTestData.matrix;
            await ActionResultFlow.placeMatrixMarks(actor, targets, marks);
        }
    });
};

export const handleRenderChatMessage = (app: ChatMessage, html, data) => {
    /**
     * Apply damage to the actor speaking the chat card.
     */
    html.on('click', '.apply-damage', event => chatMessageActionApplyDamage(html, event));
}

/**
 * Clicking on a damage number within any chat message will trigger damage application.
 * @param event
 */
export const chatMessageActionApplyDamage = async (html, event) => {
    event.stopPropagation();
    event.preventDefault();
    const applyDamage = $(event.currentTarget);

    const value = Number(applyDamage.data('damageValue'));
    const type = String(applyDamage.data('damageType')) as DamageType;
    const ap = Number(applyDamage.data('damageAp'));
    const element = String(applyDamage.data('damageElement')) as DamageElement;
    let damage = Helpers.createDamageData(value, type, ap, element);

    let actors = Helpers.getSelectedActorsOrCharacter();

    // Should no selection be available try guessing.
    if (actors.length === 0) {
        const messageId = html.data('messageId');

        const test = await TestCreator.fromMessage(messageId);
        if (!test) return
        await test.populateDocuments();

        // If targeting is available, use that.
        if (test.hasTargets) test.targets.forEach(target => actors.push(target.actor as SR5Actor));
        // Otherwise apply to the actor casting the damage.
        else actors.push(test.actor as SR5Actor);
    }

    // Abort if no actors could be collected.
    if (actors.length === 0) {
        ui.notifications?.warn(game.i18n.localize("SR5.Warnings.TokenSelectionNeeded"));
        return;
    }

    await new DamageApplicationFlow().runApplyDamage(actors, damage);
}