import { SR5Actor } from './actor/SR5Actor';
import { SR5Item } from './item/SR5Item';
import Template from './template';
import DamageData = Shadowrun.DamageData;
import AttackData = Shadowrun.AttackData;
import {CORE_FLAGS, CORE_NAME, FLAGS, SYSTEM_NAME} from './constants';
import {ShadowrunRoll, Test} from "./rolls/ShadowrunRoller";
import DrainData = Shadowrun.DrainData;
import {Helpers} from "./helpers";

export interface TargetChatMessageOptions {
    actor: Actor
    target: Token
    item: SR5Item
    incomingAttack: AttackData
    tests: Test[]
    whisperTo: User
}

// Simple card text messages
export interface ItemChatMessageOptions {
    actor: SR5Actor
    item: SR5Item
    header: {
        name: string
        img: string
    }
    description: object
    tests?: Test[]
}

export interface RollChatMessageOptions {
    roll: ShadowrunRoll
    actor?: SR5Actor
    target?: Token

    item?: SR5Item

    title: string
    description?: object

    rollMode?: keyof typeof CONFIG.dice.rollModes
    previewTemplate?: boolean

    attack?: AttackData
    incomingAttack?: AttackData
    incomingDrain?: DrainData
    incomingSoak?: DamageData
    tests?: Test[];
}

interface ItemChatTemplateData {
    actor: SR5Actor
    item: SR5Item
    header: {
        name: string
        img: string
    }
    description: object
    tests?: Test[]
}

interface RollChatTemplateData {
    actor?: SR5Actor
    tokenId?: string
    target?: Token
    item?: SR5Item

    title: string
    description?: object;

    roll: ShadowrunRoll

    rollMode: keyof typeof CONFIG.dice.rollModes
    previewTemplate?: boolean

    attack?: AttackData
    // TODO: group 'incoming' with type field instead of multiple incoming types.
    incomingAttack?: AttackData
    incomingDrain?: DrainData
    incomingSoak?: DamageData
    tests?: Test[];
}

async function createChatMessage(templateData, options?: ChatDataOptions): Promise<Entity<any>> {
    const chatData = await createChatData(templateData, options);
    const message = await ChatMessage.create(chatData);
    console.log('Chat Message', message, chatData);
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
        showGlitchAnimation: game.settings.get(SYSTEM_NAME, FLAGS.ShowGlitchAnimation),
    };
    const html = await renderTemplate(template, enhancedTemplateData);



    const chatData = {
        user: game.user._id,
        type: options?.roll ? CONST.CHAT_MESSAGE_TYPES.ROLL : CONST.CHAT_MESSAGE_TYPES.OTHER,
        sound: options?.roll ? CONFIG.sounds.dice : undefined,
        content: html,
        roll: options?.roll ? JSON.stringify(options?.roll) : undefined,
        speaker: {
            actor: actor?._id,
            token: actor?.getToken(),
            //alias: templateData.header.name
        },
        flags: {
            shadowrun5e: {
                customRoll: true,
            },
        }
    };

    const rollMode = templateData.rollMode ?? game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);

    if (['gmroll', 'blindroll'].includes(rollMode as string)) chatData['whisper'] = ChatMessage.getWhisperRecipients('GM');
    if (rollMode === 'blindroll') chatData['blind'] = true;

    if (options?.whisperTo) {
        chatData['whisper'] = ChatMessage.getWhisperRecipients(options.whisperTo.name);
    }

    return chatData;
};


export async function ifConfiguredCreateDefaultChatMessage({roll, actor, title, rollMode}: Partial<RollChatMessageOptions>) {
    if (game.settings.get(SYSTEM_NAME, FLAGS.DisplayDefaultRollCard) && roll) {
        await roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: actor }),
            flavor: title,
            rollMode: rollMode,
        });
    }
}

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
    let {actor, item, description, tests, header} = options;

    return {
        actor,
        item,
        header,
        description,
        tests
    }
}

export async function createRollChatMessage(options: RollChatMessageOptions): Promise<Entity<any>> {
    await ifConfiguredCreateDefaultChatMessage(options);

    const templateData = getRollChatTemplateData(options);
    // TODO: Double data is bad.
    const chatOptions = {roll: options.roll};
    return await createChatMessage(templateData, chatOptions);
}


function getRollChatTemplateData(options: RollChatMessageOptions): RollChatTemplateData {
    // field extraction is explicit to enforce visible data flow to ensure clean data.
    // NOTE: As soon as clear data dynamic data flow can be established, this should be removed for a simple {...options}
    let {roll, actor, item, target, description, title, previewTemplate,
        attack, incomingAttack, incomingDrain, incomingSoak, tests} = options;

    const rollMode = options.rollMode ?? game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);

    const token = actor?.getToken();

    // [name, img] = getPreferedNameAndImageSource(name, img, actor, token);
    // const header = {name, img};
    const tokenId = getTokenSceneId(token);

    return {
        roll,
        actor,
        item,
        tokenId,
        target,
        rollMode,
        title,
        description,
        previewTemplate,
        attack,
        incomingAttack,
        incomingDrain,
        incomingSoak,
        tests
    }
}

/** Use either the actor or the tokens name and image, depending on system settings.
 *
 * However don't change anything if a custom name or image has been given.
 */
function getPreferedNameAndImageSource(name?: string, img?: string, actor?: SR5Actor, token?: Token): [string, string] {

    const namedAndImageMatchActor = name === actor?.name && img === actor?.img;
    const useTokenNameForChatOutput = game.settings.get(SYSTEM_NAME, FLAGS.ShowTokenNameForChatOutput);

    if (namedAndImageMatchActor && useTokenNameForChatOutput && token) {
        img = token?.data.img;
        name = token?.data.name;
    }

    name = name ? name : '';
    img = img ? img : '';

    return [name, img];
}

function getTokenSceneId(token: Token|undefined): string|undefined {
    return token ? `${token.scene._id}.${token.id}` : undefined;
}

export const addChatMessageContextOptions = (html, options) => {
    const canRoll = (li) => {
        const msg = game.messages.get(li.data().messageId);

        return msg.getFlag(SYSTEM_NAME, FLAGS.MessageCustomRoll);
    };

    options.push(
        {
            name: 'Push the Limit',
            callback: (li) => SR5Actor.pushTheLimit(li),
            condition: canRoll,
            icon: '<i class="fas fa-meteor"></i>',
        },
        {
            name: 'Second Chance',
            callback: (li) => SR5Actor.secondChance(li),
            condition: canRoll,
            icon: '<i class="fas fa-dice-d6"></i>',
        },
    );
    return options;
};

export const addRollListeners = (app: ChatMessage, html) => {
    if (!app.getFlag(SYSTEM_NAME, FLAGS.MessageCustomRoll)) {
        return
    }

    // const item = SR5Item.getItemFromMessage(html);
    // TODO: Move layout functionality into template
    // if (item?.hasRoll && app.isRoll) $(html).find('.card-description').hide();

    html.on('click', '.test', async (event) => {
        event.preventDefault();
        const item = SR5Item.getItemFromMessage(html);
        const type = event.currentTarget.dataset.action;
        if (!item) {
            console.error(`Test of type '${type}' can't be rolled without an item dataset. This is a bug.`);
            return;
        }

        await item.rollTestType(type, event);
    });
    html.on('click', '.place-template', (event) => {
        event.preventDefault();
        const item = SR5Item.getItemFromMessage(html);
        console.error(item);
        if (item) {
            const template = Template.fromItem(item);
            template?.drawPreview();
        }
    });
    html.on('click', '.show-display-description', (event) => {
        event.preventDefault();
        // NOTE: This depends on the exact card template HTML structure.
        $(event.currentTarget).parent().siblings('.card-description').toggle();
        $(event.currentTarget).hide();
        $(event.currentTarget).siblings('.hide-display-description').show();
    });
    html.on('click', '.hide-display-description', (event) => {
        event.preventDefault();
        // NOTE: This depends on the exact card template HTML structure.
        $(event.currentTarget).parent().siblings('.card-description').toggle();
        $(event.currentTarget).hide();
        $(event.currentTarget).siblings('.show-display-description').show();
    });
    html.on('click', '.card-content', event => {
       event.preventDefault();
       // NOTE: This depends on the exact card template HTML structure.
       $(event.currentTarget).siblings('.dice-rolls').toggle();
    });

    html.on('click', '.chat-entity-link', event => {
        event.preventDefault();
        const entityLink = $(event.currentTarget);
        const id = entityLink.data('id');
        const type = entityLink.data('entity');

        if (!id) return;

        // TODO: Refactor for multi entity type usability.
       if (type === 'Token') {
           const token = canvas.tokens.get(id);
           const sheet = token.actor.sheet;
           sheet.render(true, {token: token});
       }

       else if (type === 'Item') {
           const card = entityLink.closest('.chat-card');
           const sceneTokenId = card.data('tokenId');

           const token = Helpers.getSceneToken(sceneTokenId)

           if (!token) return;

           const item = token.actor.getOwnedItem(id);
           if (item) item.sheet.render(true);
       }
    });

    html.on('click', '.chat-select-link', event => {
        event.preventDefault();

        const selectLink = $(event.currentTarget);
        const tokenId = selectLink.data('tokenId');
        const token = canvas.tokens.get(tokenId);

        if (token) {
            token.control();
        }
    });
};