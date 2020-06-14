import { SR5Actor } from '../actor/SR5Actor';
import ModList = Shadowrun.ModList;
import BaseValuePair = Shadowrun.BaseValuePair;
import DamageData = Shadowrun.DamageData;
import { SR5Item } from '../item/SR5Item';
import AttackData = Shadowrun.AttackData;
import LabelField = Shadowrun.LabelField;

export type ShadowrunRollCardProps = {
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

export const ShadowrunRollChatData = async (templateData: ShadowrunRollCardProps, roll?) => {
    const template = `systems/shadowrun5e/templates/rolls/roll-card.html`;
    const html = await renderTemplate(template, templateData);
    const actor = templateData.actor;

    const chatData = {
        user: game.user._id,
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        content: html,
        roll,
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

    if (['gmroll', 'blindroll'].includes(rollMode))
        chatData['whisper'] = ChatMessage.getWhisperIDs('GM');
    if (rollMode === 'blindroll') chatData['blind'] = true;

    return chatData;
};
