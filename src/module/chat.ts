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
    tokenId?: string
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
 * @param templateData An untyped object carrying data to display. The template should itself check for what properties are available and only renders what's given.
 */
async function createChatMessage(templateData, options?: ChatDataOptions): Promise<ChatMessage|null> {
    const chatData = await createChatData(templateData, options);
    const message = await ChatMessage.create(chatData);

    if (!message) return null;

    // Support for Dice So Nice module. This is necessary due to Foundry 0.8 removing support for hidden custom content
    // roll type chat messages, which Dice So Nice hooks into for it's rolls.
    // TODO: This might be removed if Foundry reverses the chat message type roll behavior of custom content being always visible.
    // @ts-ignore // dice3d is a module field of Dice So Nice
    if (game.dice3d && options.roll) {
        // @ts-ignore // Note: While showDiceSoNice can be called async, where not doing so here to avoid stalling.
        Helpers.showDiceSoNice(options.roll, chatData.whisper, chatData.blind);
    }

    // Store data in chat message for later use (opposed tests)
    if (templateData.roll) await message.setFlag(SYSTEM_NAME, FLAGS.Roll, templateData.roll);
    if (templateData.attack) await message.setFlag(SYSTEM_NAME, FLAGS.Attack, templateData.attack);
    // Use Scene Token IDs in order to still receive tokens/items when the scene has changed when opening from chat.
    if (templateData.targets) await message.setFlag(SYSTEM_NAME, FLAGS.TargetsSceneTokenIds, templateData.targets.map(target => getTokenSceneId(target.document)));
    if (templateData.actionTestData) await message.setFlag(SYSTEM_NAME, FLAGS.ActionTestData, templateData.actionTestData);

    return message;
}

interface ChatDataOptions {
    roll?: ShadowrunRoll,
    whisperTo?: User
}

// templateData has no datatype to pipe through whatever it's given.
// Clean up your data within templateData creation functions!
const createChatData = async (templateData, options?: ChatDataOptions) => {
    const template = `systems/shadowrun5e/dist/templates/rolls/roll-card.html`;
    const actor = templateData.actor;
    const token = actor?.getToken();

    //@ts-ignore
    const enhancedTemplateData = {
        ...templateData,
        speaker: {
            actor, token
        },
        showGlitchAnimation: game.settings.get(SYSTEM_NAME, FLAGS.ShowGlitchAnimation)
    };
    const html = await renderTemplate(template, enhancedTemplateData);

    const chatData = {
        user: game.user?.id,
        // NOTE: Type Roll used to make a whispered message visible with it's content being invisible. That's not the case
        //       with Foundry 0.8 anymore. Should that have changed, just uncomment this line.
        // type: options?.roll ? CONST.CHAT_MESSAGE_TYPES.ROLL : CONST.CHAT_MESSAGE_TYPES.OTHER,
        sound: options?.roll ? CONFIG.sounds.dice : undefined,
        content: html,
        roll: options?.roll ? JSON.stringify(options?.roll) : undefined,
        speaker: {
            actor: actor?.id,
            token: token?.id,
            alias: game.user?.name
        },
        flags: {
            shadowrun5e: {
                customRoll: true,
            },
        }
    };

    // Applying roll mode will set correct whisper recipients.
    const rollMode = templateData.rollMode ?? game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);
    // @ts-ignore
    ChatMessage.applyRollMode(chatData, rollMode);
    // @ts-ignore
    chatData.rollMode = rollMode;
    // if (['gmroll', 'blindroll'].includes(rollMode as string)) chatData['whisper'] = ChatMessage.getWhisperRecipients('GM');
    // if (rollMode === 'blindroll') chatData['blind'] = true;

    // If a specific whisper recipient has been set, overwrite Foundry default.
    if (options?.whisperTo) {
        chatData['whisper'] = ChatMessage.getWhisperRecipients(options.whisperTo.name as string);
    }

    return chatData;
};

export async function createTargetChatMessage(options: TargetChatMessageOptions) {
    const rollChatOptions = {...options};
    const messageOptions = {whisperTo: options.whisperTo};
    //@ts-ignore
    const templateData = getRollChatTemplateData(rollChatOptions);
    return await createChatMessage(templateData, messageOptions);
}

export async function createItemChatMessage(options: ItemChatMessageOptions) {
    const templateData = createChatTemplateData(options);
    return await createChatMessage(templateData);
}

function createChatTemplateData(options: ItemChatMessageOptions): ItemChatTemplateData {
    // field extraction is explicit to enforce visible data flow to ensure clean data.
    // NOTE: As soon as clear data dynamic data flow can be established, this should be removed for a simple {...options}
    let {actor, item, description, tests} = options;

    const token = actor?.getToken();
    const tokenId = getTokenSceneId(token);
    const title = game.i18n.localize("SR5.Description");

    return {
        title,
        actor,
        tokenId,
        item,
        description,
        tests
    }
}

function getRollChatTemplateData(options: RollChatMessageOptions): RollChatTemplateData {
    const token = options.actor?.getToken();

    const rollMode = options.rollMode ?? game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);
    const tokenId = getTokenSceneId(token);

    const targetTokenId = getTokenSceneId(options.target?.document);

    return {
        ...options,
        tokenId,
        targetTokenId,
        // @ts-ignore
        rollMode,
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
        const message = game.messages?.get(messageId);
        if (!message) return;
        const targetIds = message.getFlag(SYSTEM_NAME, FLAGS.TargetsSceneTokenIds) as string[];

        // If targeting is available, use that.
        if (targetIds) {
            targetIds.forEach(targetId => {
                const actor = Helpers.getSceneTokenActor(targetId);
                if (!actor) return;
                actors.push(actor);
            });

            // Otherwise apply to the actor casting the damage.
        } else {
            const sceneTokenId = html.find('.chat-card').data('tokenId');
            const actor = Helpers.getSceneTokenActor(sceneTokenId)
            if (actor) {
                actors.push(actor);
            }
        }

        if (actors.length === 0) {
            ui.notifications?.warn(game.i18n.localize("SR5.Warnings.TokenSelectionNeeded"));
            return;
        }
    }

    await new DamageApplicationFlow().runApplyDamage(actors, damage);
}