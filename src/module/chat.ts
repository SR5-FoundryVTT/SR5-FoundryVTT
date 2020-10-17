import { SR5Actor } from './actor/SR5Actor';
import { SR5Item } from './item/SR5Item';
import Template from './template';
import ModList = Shadowrun.ModList;
import BaseValuePair = Shadowrun.BaseValuePair;
import DamageData = Shadowrun.DamageData;
import AttackData = Shadowrun.AttackData;
import LabelField = Shadowrun.LabelField;
import { FLAGS, SYSTEM_NAME } from './constants';
import { PartsList } from './parts/PartsList';

export type TemplateData = {
    header: {
        name: string;
        img: string;
    };
    tokenId?: string;
    dice?: Die[];
    parts?: ModList<number>;
    limit?: BaseValuePair<number> & LabelField;
    testName?: string;
    actor?: SR5Actor;
    target?: SR5Actor;
    item?: SR5Item;
    attack?: AttackData;
    incomingAttack?: AttackData;
    incomingDrain?: LabelField & {
        value: number;
    };
    hits?: number;
    soak?: DamageData;
    tests?: {
        label: string;
        type: string;
    }[];
    description?: object;
    previewTemplate?: boolean;
    rollMode?: keyof typeof CONFIG.Dice.rollModes;
};

export const createChatData = async (templateData: TemplateData, roll?: Roll) => {
    const template = `systems/shadowrun5e/dist/templates/rolls/roll-card.html`;
    const hackyTemplateData = {
        ...templateData,
        parts: new PartsList(templateData.parts).getMessageOutput(),
        showGlitchAnimation: game.settings.get(SYSTEM_NAME, FLAGS.ShowGlitchAnimation),
    };
    const html = await renderTemplate(template, hackyTemplateData);
    const actor = templateData.actor;
    console.error('createChatData-template', templateData);

    const chatData = {
        user: game.user._id,
        type: roll ? CONST.CHAT_MESSAGE_TYPES.ROLL : CONST.CHAT_MESSAGE_TYPES.OTHER,
        content: html,
        roll: roll ? JSON.stringify(roll) : undefined,
        speaker: {
            actor: actor?._id,
            token: actor?.token,
            alias: templateData.header.name,
        },
        flags: {
            shadowrun5e: {
                customRoll: true,
            },
        },
    };
    if (roll) {
        chatData['sound'] = CONFIG.sounds.dice;
    }
    const rollMode = templateData.rollMode ?? game.settings.get('core', 'rollMode');

    if (['gmroll', 'blindroll'].includes(rollMode)) chatData['whisper'] = ChatMessage.getWhisperRecipients('GM');
    if (rollMode === 'blindroll') chatData['blind'] = true;

    return chatData;
};

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
    if (!app.getFlag(SYSTEM_NAME, FLAGS.MessageCustomRoll)) return;
    const item = SR5Item.getItemFromMessage(html);

    html.on('click', '.test', async (event) => {
        event.preventDefault();
        const type = event.currentTarget.dataset.action;
        if (item) {
            await item.rollTestType(type, event);
        }
    });
    html.on('click', '.place-template', (event) => {
        event.preventDefault();
        if (item) {
            const template = Template.fromItem(item);
            template?.drawPreview();
        }
    });
    html.on('click', '.card-title', (event) => {
        event.preventDefault();
        $(event.currentTarget).siblings('.card-description').toggle();
    });
    if (item?.hasRoll && app.isRoll) $(html).find('.card-description').hide();
};


type PartData = {
    whisper: string,
    roll?: Roll,
    actor?: SR5Actor
}
type ChatData = {
    roll? : Roll,
    user: User,
    flags: object,
    type: number,
    content: HTMLElement,
    speaker: {
        actor: string,
        token: Token,
        alias: string
    }
}
type MessagePart = {
    templateData: object,
    templatePath: string,
    partData: PartData
}

type RenderedMessagePart = {
    content: HTMLElement,
    // TODO: typing
    chatData: ChatData,
}

// Hooks.once('ready', async () => {
//     console.error('ChatMessageManager');
//     const chatMessageManager = new ChatMessageManager();
//     const template = `systems/shadowrun5e/dist/templates/rolls/roll-card.html`;
//     const templateData = {};
//     const partData = {
//         whisper: 'GM',
//         Roll: undefined
//     };
//     chatMessageManager.createPart(template, templateData, partData);
//     await chatMessageManager.send();
// });

/** Issues and thoughts
 *
 * Separate message parts still need an header (
 *
 */
export class ChatMessageManager {
    parts: MessagePart[] = [];

    createPart(templatePath: string, templateData: object, partData: PartData) {
        const part = {templatePath, templateData, partData};
        this.parts.push(part);
    }

    async send() {
        if (!this.parts) {
            return;
        }

        for (const part of this.parts) {

            const {whisper, roll, actor} = part.partData;

            const content = this.renderPart(part);
            const flags = this._getChatDataFlags();
            const speaker = this._getChatDataSpeaker(actor)
            const user = game.user;

            const data = {
                user,
                speaker,
                content,
                flags,
                roll,
            }

            const message = await ChatMessage.create(data);
        }
    }


    async renderPart(part: MessagePart): Promise<HTMLElement> {
        return await renderTemplate(part.templatePath, part.templateData);
    }

    _getChatDataFlags() {
        return {
            shadowrun5e: {
                customRoll: true,
            },
        }
    }

    _getChatDataSpeaker(actor?: SR5Actor) {
        if (!actor) {
            return;
        }

        return {
            actor: actor._id,
            token: actor.token,
            // TODO: Alias?
            // alias: templateData.header.name,
        }
    }
}