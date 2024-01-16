import {CORE_FLAGS, CORE_NAME} from './constants';

/**
 * The legacy chat message approach of the system uses a generic chat message to display roll and item information.
 *
 * NOTE: This approach has been deprecated in Foundry 0.8 and should be replaced with custom Roll implementation for each kind of Roll (ActionRoll, AttackRoll, OpposedRoll, ...).
 *
 * @param template The dist path to be used as a template file.
 * @param templateData An untyped object carrying data to display. The template should itself check for what properties are available and only renders what's given.
 */
export async function createChatMessage(template: string, templateData): Promise<ChatMessage|null> {
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

    // @ts-expect-error
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