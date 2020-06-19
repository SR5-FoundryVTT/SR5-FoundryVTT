import { SR5Actor } from './actor/SR5Actor';
import { SR5Item } from './item/SR5Item';
import Template from './template';
import ModList = Shadowrun.ModList;
import BaseValuePair = Shadowrun.BaseValuePair;
import DamageData = Shadowrun.DamageData;
import AttackData = Shadowrun.AttackData;
import LabelField = Shadowrun.LabelField;

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
    item?: SR5Item;
    attack?: AttackData;
    incomingAttack?: AttackData;
    incomingDrain?: LabelField & {
        value: number;
    };
    soak?: DamageData;
    tests?: {
        label: string;
        type: string;
    }[];
    description?: object;
    previewTemplate?: boolean;
};

export const createChatData = async (templateData: TemplateData, roll?: Roll) => {
    const template = `systems/shadowrun5e/templates/rolls/roll-card.html`;
    const html = await renderTemplate(template, templateData);
    const actor = templateData.actor;

    const chatData = {
        user: game.user._id,
        type: roll ? CONST.CHAT_MESSAGE_TYPES.ROLL : CONST.CHAT_MESSAGE_TYPES.OTHER,
        content: html,
        roll: roll ? JSON.stringify(roll) : undefined,
        speaker: {
            actor: actor?._id,
            token: actor?.token,
            alias: actor?.name,
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
    const rollMode = game.settings.get('core', 'rollMode');

    if (['gmroll', 'blindroll'].includes(rollMode)) chatData['whisper'] = ChatMessage.getWhisperIDs('GM');
    if (rollMode === 'blindroll') chatData['blind'] = true;

    return chatData;
};

export const addChatMessageContextOptions = (html, options) => {
    const canRoll = (li) => {
        const msg = game.messages.get(li.data().messageId);

        return msg.getFlag('shadowrun5e', 'customRoll');
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
    if (!app.getFlag('shadowrun5e', 'customRoll')) return;
    html.on('click', '.test-roll', async (event) => {
        event.preventDefault();
        const item = SR5Item.getItemFromMessage(html);
        if (item) {
            const roll = await item.rollTest(event, { hideRollMessage: true });
            if (roll && roll.templateData) {
                const template = `systems/shadowrun5e/templates/rolls/roll-card.html`;
                const html = await renderTemplate(template, roll.templateData);
                const data = {};
                data['content'] = html;
                await app.update(data);
            }
        }
    });
    html.on('click', '.test', async (event) => {
        event.preventDefault();
        const type = event.currentTarget.dataset.action;
        const item = SR5Item.getItemFromMessage(html);
        if (item) {
            await item.rollExtraTest(type, event);
        }
    });
    html.on('click', '.place-template', (event) => {
        event.preventDefault();
        const item = SR5Item.getItemFromMessage(html);
        if (item) {
            const template = Template.fromItem(item);
            template?.drawPreview(event);
        }
    });
    html.on('click', '.card-title', (event) => {
        event.preventDefault();
        $(event.currentTarget).siblings('.card-description').toggle();
    });
    $(html).find('.card-description').hide();
};
