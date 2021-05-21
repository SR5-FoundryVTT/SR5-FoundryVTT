import {SR5Actor} from './actor/SR5Actor';
import {SR5Item} from './item/SR5Item';
import Template from './template';
import {CORE_FLAGS, CORE_NAME, FLAGS, SYSTEM_NAME} from './constants';
import {ShadowrunRoll, Test} from "./rolls/ShadowrunRoller";
import {Helpers} from "./helpers";
import {DamageApplicationFlow} from './actor/DamageApplicationFlow';
import AttackData = Shadowrun.AttackData;
import DrainData = Shadowrun.DrainData;
import ModifiedDamageData = Shadowrun.ModifiedDamageData;
import DamageType = Shadowrun.DamageType;
import DamageElement = Shadowrun.DamageElement;
import CombatData = Shadowrun.CombatData;

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


    // @ts-ignore // TODO: TYPE: Remove this...
    rollMode?: keyof typeof CONFIG.dice.rollModes
    previewTemplate?: boolean

    attack?: AttackData
    incomingAttack?: AttackData
    incomingDrain?: DrainData
    damage?: ModifiedDamageData
    tests?: Test[]
    combat?: CombatData
    reach?: number
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
    // @ts-ignore // TODO: TYPE: Remove this...
    rollMode: keyof typeof CONFIG.dice.rollModes
}

async function createChatMessage(templateData, options?: ChatDataOptions): Promise<Entity<any>|null> {
    const chatData = await createChatData(templateData, options);
    const message = await ChatMessage.create(chatData);

    if (!message) return null;

    // Store data in chat message for later use (opposed tests)
    if (templateData.roll) await message.setFlag(SYSTEM_NAME, FLAGS.Roll, templateData.roll);
    if (templateData.attack) await message.setFlag(SYSTEM_NAME, FLAGS.Attack, templateData.attack);
    // Convert targets into scene token ids.
    if (templateData.targets) await message.setFlag(SYSTEM_NAME, FLAGS.TargetsSceneTokenIds, templateData.targets.map(target => getTokenSceneId(target)));

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
        chatData['whisper'] = ChatMessage.getWhisperRecipients(options.whisperTo.name);
    }



    return chatData;
};


export async function ifConfiguredCreateDefaultChatMessage({
                                                               roll,
                                                               actor,
                                                               title,
                                                               rollMode
                                                           }: Partial<RollChatMessageOptions>) {
    if (game.settings.get(SYSTEM_NAME, FLAGS.DisplayDefaultRollCard) && roll) {
        await roll.toMessage({
            speaker: ChatMessage.getSpeaker({actor: actor}),
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

export async function createRollChatMessage(options: RollChatMessageOptions): Promise<Entity<any>|null> {
    await ifConfiguredCreateDefaultChatMessage(options);

    const templateData = getRollChatTemplateData(options);
    const chatOptions = {roll: options.roll};
    return await createChatMessage(templateData, chatOptions);
}


function getRollChatTemplateData(options: RollChatMessageOptions): RollChatTemplateData {
    const token = options.actor?.getToken();

    const rollMode = options.rollMode ?? game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);
    const tokenId = getTokenSceneId(token);

    const targetTokenId = getTokenSceneId(options.target);

    return {
        ...options,
        tokenId,
        targetTokenId,
        // @ts-ignore // TODO: TYPE: Remove this...
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
function getTokenSceneId(token: Token | undefined): string | undefined {
    if (!token) return;
    // TODO: Foundry 0.8 token.parent vs token.scene breaking change.
    const scene = token.scene || token.parent;
    // @ts-ignore
    return `${scene.id}.${token.id}`;
}

export const addChatMessageContextOptions = (html, options) => {
    const canRoll = (li) => {
        const message = game.messages?.get(li.data().messageId);

        if (!message) return;

        return message.getFlag(SYSTEM_NAME, FLAGS.MessageCustomRoll);
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

    html.on('click', '.test', async (event) => {
        event.preventDefault();
        if (!game || !game.ready) return;

        const messageId = html.data('messageId');
        const message = game.messages?.get(messageId);
        if (!message) return;
        const attack = message.getFlag(SYSTEM_NAME, FLAGS.Attack) as AttackData;
        const item = SR5Item.getItemFromMessage(html);

        const type = event.currentTarget.dataset.action;
        if (!item) {
            ui.notifications?.error(game.i18n.localize('SR5.MissingItemForOpposedTest'));
            return;
        }

        // Selection will overwrite chat specific targeting
        const actors = Helpers.getSelectedActorsOrCharacter();

        // No selection, fall back to targeting.
        if (actors.length === 0) {
            const targetSceneIds = message.getFlag(SYSTEM_NAME, FLAGS.TargetsSceneTokenIds) as string[];

            for (const targetSceneId of targetSceneIds) {
                const actor = Helpers.getSceneTokenActor(targetSceneId)
                if (!actor) continue;

                actors.push(actor);
            }
        }

        if (!actors) return;

        for (const actor of actors) {
            await item.rollTestType(type, attack, event, actor);
        }
    });
    html.on('click', '.place-template', (event) => {
        event.preventDefault();
        const item = SR5Item.getItemFromMessage(html);

        if (item) {
            const template = Template.fromItem(item);
            template?.drawPreview();
        }
    });

    html.on('click', '.card-main-content', event => {
        event.preventDefault();
        // NOTE: This depends on the exact card template HTML structure.
        const card = $(event.currentTarget).closest('.chat-card');
        card.children('.dice-rolls').toggle();
        card.children('.card-description').toggle();
    });


    /** Open the sheets of different document types based on the chat card.
     */
    html.on('click', '.chat-document-link', event => {
        event.preventDefault();
        if (!game || !game.ready || !canvas || !canvas.ready) return;

        const documentLink = $(event.currentTarget);
        const id = documentLink.data('id');
        const type = documentLink.data('entity');

        if (!id) return;

        if (type === 'Token') {
            const token = canvas.tokens.get(id);
            if (!token) return;
            // @ts-ignore
            token.actor.sheet.render(true, {token});
        } else if (type === 'Actor') {
            const actor = game.actors?.get(id);
            if (!actor) return;
            // @ts-ignore
            actor.sheet.render(true);
        } else if (type === 'Item') {
            const card = documentLink.closest('.chat-card');
            const sceneTokenId = card.data('tokenId');

            const actor = Helpers.getSceneTokenActor(sceneTokenId);
            const item = actor.getOwnedItem(id);
            if (!item) return;
            // @ts-ignore
            item.sheet.render(true);
        }
    });

    /** Select a Token on the current scene based on the link id.
     */
    html.on('click', '.chat-select-link', event => {
        event.preventDefault();

        if (!game || !game.ready || !canvas || !canvas.ready) return;

        const selectLink = $(event.currentTarget);
        const tokenId = selectLink.data('tokenId');
        const token = canvas.tokens.get(tokenId);

        if (token) {
            token.control();
        } else {
            ui.notifications?.warn(game.i18n.localize('SR5.NoSelectableToken'))
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
    });
};