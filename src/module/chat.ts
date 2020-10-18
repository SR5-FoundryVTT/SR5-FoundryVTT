import { SR5Actor } from './actor/SR5Actor';
import { SR5Item } from './item/SR5Item';
import Template from './template';
import ModList = Shadowrun.ModList;
import BaseValuePair = Shadowrun.BaseValuePair;
import DamageData = Shadowrun.DamageData;
import AttackData = Shadowrun.AttackData;
import LabelField = Shadowrun.LabelField;
import {CORE_FLAGS, CORE_NAME, FLAGS, SYSTEM_NAME} from './constants';
import { PartsList } from './parts/PartsList';
import {ShadowrunRoll, ShadowrunRoller, Test} from "./rolls/ShadowrunRoller";

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
    target?: Token;
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
    const rollMode = templateData.rollMode ?? game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);

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
    if (!app.getFlag(SYSTEM_NAME, FLAGS.MessageCustomRoll)) {
        return
    }

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
        console.error(item);
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

type RollChatMessageOptions = {
    actor?: SR5Actor
    token?: Token
    target?: Token

    item?: SR5Item

    name?: string
    img?: string
    title: string
    description?: object

    rollMode: keyof typeof CONFIG.dice.rollModes
    previewTemplate?: boolean

    attack?: AttackData
    tests?: Test[];
}

type RollChatTemplateData = {
    actor?: SR5Actor
    header: {
        name: string
        img: string
    }
    tokenId?: string
    target?: Token
    item?: SR5Item

    title: string
    description?: object;

    roll?: ShadowrunRoll

    rollMode: keyof typeof CONFIG.dice.rollModes
    previewTemplate?: boolean

    attack?: AttackData
    tests?: Test[];
}

export async function createRollChatMessage(roll: ShadowrunRoll, options: RollChatMessageOptions): Promise<Entity<any>> {
    const templateData = getRollChatTemplateData(roll, options);
    const chatData = await createChatData(templateData, roll);
    // TODO: What does displaySheet even do?
    const message = await ChatMessage.create(chatData, {displaySheet: false});
    console.error('New ', templateData);
    return message;
}

export function getRollChatTemplateData(roll: ShadowrunRoll, options: RollChatMessageOptions): RollChatTemplateData {
    // field extraction is explicit to enforce visible data flow to ensure clean data.
    // NOTE: As soon as clear data dynamic data flow can be established, this should be removed for a simple {...options}
    let {actor, token, item, name, img, rollMode, target, description, title, previewTemplate, attack, tests} = options;

    [name, img] = getPreferedNameAndImageSource(name, img, actor, token);
    const header = {name, img};
    const tokenId = getTokenSceneId(token);
    return {
        actor,
        item,
        header,
        tokenId,
        target,
        rollMode,
        title,
        description,
        roll,
        previewTemplate,
        attack,
        tests
    }
}

/** Use either the actor or the tokens name and image, depending on system settings.
 *
 * However don't change anything if a custom name or image has been given.
 */
export function getPreferedNameAndImageSource(name?: string, img?: string, actor?: SR5Actor, token?: Token): [string, string] {

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