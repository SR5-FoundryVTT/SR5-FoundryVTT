import {CORE_FLAGS, CORE_NAME, FLAGS, SYSTEM_NAME} from './constants';
import {Helpers} from "./helpers";
import {ActionResultFlow} from "./item/flows/ActionResultFlow";


export const addRollListeners = (app: ChatMessage, html) => {

    /**
     * Apply action results onto targets or selections.
     */
    html.on('click', '.result', async event => {
        event.stopPropagation();

        const messageId = html.data('messageId');
        const message = game.messages?.get(messageId);

        if (!message) return;

        const actionTestData = message.getFlag(SYSTEM_NAME, FLAGS.ActionTestData) as any;

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

export async function createItemChatMessage(options) {
    const templateData = createChatTemplateData(options);
    return await createChatMessage('systems/shadowrun5e/dist/templates/rolls/item-card.html', templateData);
}

function createChatTemplateData(options) {
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