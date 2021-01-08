import { SR5Actor } from './actor/SR5Actor';
import { SR5Item } from './item/SR5Item';
import Template from './template';
import AttackData = Shadowrun.AttackData;
import {CORE_FLAGS, CORE_NAME, FLAGS, SYSTEM_NAME} from './constants';
import {ShadowrunRoll, Test} from "./rolls/ShadowrunRoller";
import DrainData = Shadowrun.DrainData;
import {Helpers} from "./helpers";
import ModifiedDamageData = Shadowrun.ModifiedDamageData;
import DamageData = Shadowrun.DamageData;
import {DamageApplicationDialog} from "./apps/dialogs/DamageApplicationDialog";
import DamageType = Shadowrun.DamageType;
import DamageElement = Shadowrun.DamageElement;
import CombatData = Shadowrun.CombatData;

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
    description: object
    tests?: Test[]
}

export interface RollChatMessageOptions {
    title: string
    roll: ShadowrunRoll
    actor?: SR5Actor
    target?: Token

    item?: SR5Item

    description?: object

    rollMode?: keyof typeof CONFIG.dice.rollModes
    previewTemplate?: boolean

    attack?: AttackData
    incomingAttack?: AttackData
    incomingDrain?: DrainData
    damage?: ModifiedDamageData
    tests?: Test[]
    combat?: CombatData
}

interface ItemChatTemplateData {
    actor: SR5Actor
    item: SR5Item
    description: object
    tests?: Test[]
}

interface RollChatTemplateData extends RollChatMessageOptions {
    tokenId?: string
    rollMode: keyof typeof CONFIG.dice.rollModes
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
            alias: game.user.name
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
    let {actor, item, description, tests} = options;

    return {
        actor,
        item,
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
    const token = options.actor?.getToken();

    const rollMode = options.rollMode ?? game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);
    const tokenId = getTokenSceneId(token);

    return {
       ...options,
        tokenId,
        rollMode,
    }
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
            name: game.i18n.localize('SR5.PushTheLimit'),
            callback: (li) => SR5Actor.pushTheLimit(li),
            condition: canRoll,
            icon: '<i class="fas fa-meteor"></i>',
        },
        {
            name: game.i18n.localize('SR5.SecondChange'),
            callback: (li) => SR5Actor.secondChance(li),
            condition: canRoll,
            icon: '<i class="fas fa-dice-d6"></i>',
        }
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
            ui.notifications.error(game.i18n.localize('SR5.MissingItemForOpposedTest'));
            return;
        }

        await item.rollTestType(type, event);
    });
    html.on('click', '.place-template', (event) => {
        event.preventDefault();
        const item = SR5Item.getItemFromMessage(html);

        if (item) {
            const template = Template.fromItem(item);
            template?.drawPreview();
        }
    });
    html.on('click', '.card-content', event => {
       event.preventDefault();
       // NOTE: This depends on the exact card template HTML structure.
       $(event.currentTarget).siblings('.dice-rolls').toggle();
       $(event.currentTarget).siblings('.card-description').toggle();
    });

    /** Open the sheets of different entity types based on the chat card.
     */
    html.on('click', '.chat-entity-link', event => {
        event.preventDefault();
        const entityLink = $(event.currentTarget);
        const id = entityLink.data('id');
        const type = entityLink.data('entity');

        if (!id) return;

       if (type === 'Token') {
           const token = canvas.tokens.get(id);
           token.actor.sheet.render(true, {token});
       }
       else if (type === 'Actor') {
           const actor = game.actors.get(id);
           actor.sheet.render(true);
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

    /** Select a Token on the current scene based on the link id.
     */
    html.on('click', '.chat-select-link', event => {
        event.preventDefault();

        const selectLink = $(event.currentTarget);
        const tokenId = selectLink.data('tokenId');
        const token = canvas.tokens.get(tokenId);

        if (token) {
            token.control();
        } else {
            ui.notifications.warn(game.i18n.localize('SR5.NoSelectableToken'))
        }
    });

    /** Apply damage to the actor speaking the chat card.
     */
    html.on('click', '.apply-damage', async event => {
        event.stopPropagation();
        const applyDamage = $(event.currentTarget);

        const value = Number(applyDamage.data('damageValue'));
        const type = String(applyDamage.data('damageType')) as DamageType;
        const ap = Number(applyDamage.data('damageAp'));
        const element = String(applyDamage.data('damageElement')) as DamageElement;


        let damage = Helpers.createDamageData(value, type, ap, element);
        let actors = Helpers.getSelectedActorsOrCharacter();

        if (actors.length === 0) {
            ui.notifications.warn(game.i18n.localize('SR5.Warnings.TokenSelectionNeeded'));
            return;
        }

        // Show user the token selection and resulting damage values
        const damageApplicationDialog = await new DamageApplicationDialog(actors, damage);
        const actorDamages = await damageApplicationDialog.select();

        if (damageApplicationDialog.canceled) return;

        console.error(this);
        // Apply the actual damage values. applyDamage will, again, calculate armor damage modification.
        actorDamages.forEach(({actor, modified}) => {
            if (damageApplicationDialog.selectedButton === 'damage') {
                actor.applyDamage(modified);
            } else if (damageApplicationDialog.selectedButton === 'unmodifiedDamage') {
                actor.applyDamage(damage);
            } else {
                console.error('Expected a dialog selection, but none known selection was made');
            }
        });
    });
};