import ModList = Shadowrun.ModList;
import RollEvent = Shadowrun.RollEvent;
import BaseValuePair = Shadowrun.BaseValuePair;
import LabelField = Shadowrun.LabelField;
import AttackData = Shadowrun.AttackData;
import DamageData = Shadowrun.DamageData;
import { Helpers } from '../helpers';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import { createChatData, TemplateData } from '../chat';
import { SYSTEM_NAME } from '../constants';
import { PartsList } from '../parts/PartsList';

export interface BasicRollProps {
    name?: string;
    img?: string;
    parts?: ModList<number>;
    limit?: BaseValuePair<number> & LabelField;
    explodeSixes?: boolean;
    title?: string;
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
    hideRollMessage?: boolean;
}

export interface RollDialogOptions {
    environmental?: number | boolean;
    prompt?: boolean;
}

export interface AdvancedRollProps extends BasicRollProps {
    event?: RollEvent;
    extended?: boolean;
    wounds?: boolean;
    after?: (roll: Roll | undefined) => void;
    dialogOptions?: RollDialogOptions;
}

export class ShadowrunRoll extends Roll {
    templateData: TemplateData | undefined;
    toJSON(): any {
        const data = super.toJSON();
        data.class = 'Roll';
        return data;
    }
}

export class ShadowrunRoller {
    static itemRoll(event, item: SR5Item, options?: Partial<AdvancedRollProps>): Promise<ShadowrunRoll | undefined> {
        const parts = item.getRollPartsList();
        let limit = item.getLimit();
        let title = item.getRollName();

        const rollData: AdvancedRollProps = {
            ...options,
            event: event,
            dialogOptions: {
                environmental: true,
            },
            parts,
            actor: item.actor,
            item,
            limit,
            title,
            name: item.name,
            img: item.img,
            previewTemplate: item.hasTemplate,
        };
        rollData['attack'] = item.getAttackData(0);
        rollData['blast'] = item.getBlastData();

        if (item.hasOpposedRoll) {
            rollData['tests'] = [
                {
                    label: item.getOpposedTestName(),
                    type: 'opposed',
                },
            ];
        }
        if (item.isMeleeWeapon()) {
            rollData['reach'] = item.getReach();
        }
        if (item.isRangedWeapon()) {
            rollData['fireMode'] = item.getLastFireMode()?.label;
            if (rollData.dialogOptions) {
                rollData.dialogOptions.environmental = item.getLastFireRangeMod().value;
            }
        }
        rollData.description = item.getChatData();

        return ShadowrunRoller.advancedRoll(rollData);
    }

    static shadowrunFormula({
        parts: partsProps,
        limit,
        explode,
    }: {
        parts: ModList<number>;
        limit?: BaseValuePair<number> & LabelField;
        explode?: boolean;
    }): string {
        const parts = new PartsList(partsProps);
        const count = parts.total;
        if (count <= 0) {
            // @ts-ignore
            ui.notifications.error(game.i18n.localize('SR5.RollOneDie'));
            return '0d6cs>=5';
        }
        let formula = `${count}d6`;
        if (explode) {
            formula += 'x6';
        }
        if (limit?.value) {
            formula += `kh${limit.value}`;
        }
        formula += 'cs>=5';
        return formula;
    }

    static async basicRoll({
        parts: partsProps = [],
        limit,
        explodeSixes,
        title,
        actor,
        img = actor?.img,
        name = actor?.name,
        hideRollMessage,
        ...props
    }: BasicRollProps): Promise<ShadowrunRoll | undefined> {
        let roll;
        const parts = new PartsList(partsProps);
        const rollMode = game.settings.get('core', 'rollMode');
        if (parts.length) {
            const formula = this.shadowrunFormula({ parts: parts.list, limit, explode: explodeSixes });
            if (!formula) return;
            roll = new ShadowrunRoll(formula);
            roll.roll();

            if (game.settings.get(SYSTEM_NAME, 'displayDefaultRollCard')) {
                await roll.toMessage({
                    speaker: ChatMessage.getSpeaker({ actor: actor }),
                    flavor: title,
                    rollMode: rollMode,
                });
            }
        }

        // start of custom message
        const dice = roll?.parts[0].rolls;
        const token = actor?.token;
        const templateData = {
            actor: actor,
            header: {
                name: name || '',
                img: img || '',
            },
            tokenId: token ? `${token.scene._id}.${token.id}` : undefined,
            dice,
            limit,
            testName: title,
            dicePool: parts.total,
            parts: parts.list,
            hits: roll?.total,
            ...props,
        };

        roll.templateData = templateData;

        if (!hideRollMessage) {
            const chatData = await createChatData(templateData, roll);
            ChatMessage.create(chatData, { displaySheet: false }).then((message) => {
                console.log(message);
            });
        }
        return roll;
    }

    /**
     * Prompt a roll for the user
     */
    static promptRoll(): Promise<ShadowrunRoll | undefined> {
        const lastRoll = game.user.getFlag(SYSTEM_NAME, 'lastRollPromptValue') || 0;
        const parts = [{ name: 'SR5.LastRoll', value: lastRoll }];
        return ShadowrunRoller.advancedRoll({ parts, dialogOptions: { prompt: true } });
    }

    /**
     * Start an advanced roll
     * - Prompts the user for modifiers
     * @param props
     */
    static advancedRoll(props: AdvancedRollProps): Promise<ShadowrunRoll | undefined> {
        // destructure what we need to use from props
        // any value pulled out needs to be updated back in props if changed
        const { title, actor, parts: partsProps = [], limit, extended, wounds = true, after, dialogOptions } = props;
        const parts = new PartsList(partsProps);

        // remove limits if game settings is set
        if (!game.settings.get(SYSTEM_NAME, 'applyLimits')) {
            delete props.limit;
        }

        // TODO create "fast roll" option

        let dialogData = {
            options: dialogOptions,
            extended,
            dice_pool: parts.total,
            parts: parts.getMessageOutput(),
            limit: limit?.value,
            wounds,
            woundValue: actor?.getWoundModifier(),
        };
        let template = 'systems/shadowrun5e/dist/templates/rolls/roll-dialog.html';
        let edge = false;
        let cancel = true;

        const buttons = {
            roll: {
                label: game.i18n.localize('SR5.Roll'),
                icon: '<i class="fas fa-dice-six"></i>',
                callback: () => (cancel = false),
            },
        };
        if (actor) {
            buttons['edge'] = {
                label: `${game.i18n.localize('SR5.PushTheLimit')} (+${actor.getEdge().max})`,
                icon: '<i class="fas fa-bomb"></i>',
                callback: () => {
                    edge = true;
                    cancel = false;
                },
            };
        }

        return new Promise((resolve) => {
            renderTemplate(template, dialogData).then((dlg) => {
                new Dialog({
                    title: title,
                    content: dlg,
                    buttons,
                    default: 'roll',

                    close: async (html) => {
                        if (cancel) return;
                        // get the actual dice_pool from the difference of initial parts and value in the dialog

                        const dicePoolValue = Helpers.parseInputToNumber($(html).find('[name="dice_pool"]').val());

                        if (dialogOptions?.prompt && dicePoolValue > 0) {
                            parts.clear();
                            await game.user.setFlag(SYSTEM_NAME, 'lastRollPromptValue', dicePoolValue);
                            parts.addUniquePart('SR5.Base', dicePoolValue);
                        }

                        const limitValue = Helpers.parseInputToNumber($(html).find('[name="limit"]').val());

                        if (limit && limit.value !== limitValue) {
                            limit.value = limitValue;
                            limit.base = limitValue;
                            limit.label = 'SR5.Override';
                        }

                        const woundValue = Helpers.parseInputToNumber($(html).find('[name="wounds"]').val());
                        const situationMod = Helpers.parseInputToNumber($(html).find('[name="dp_mod"]').val());
                        const environmentMod = Helpers.parseInputToNumber($(html).find('[name="options.environmental"]').val());

                        if (wounds && woundValue !== 0) {
                            parts.addUniquePart('SR5.Wounds', woundValue);
                            props.wounds = true;
                        }
                        if (situationMod) {
                            parts.addUniquePart('SR5.SituationalModifier', situationMod);
                        }
                        if (environmentMod) {
                            parts.addUniquePart('SR5.EnvironmentModifier', environmentMod);
                            if (!props.dialogOptions) props.dialogOptions = {};
                            props.dialogOptions.environmental = true;
                        }

                        const extendedString = Helpers.parseInputToString($(html).find('[name="extended"]').val());
                        const extended = extendedString === 'true';

                        if (edge && actor) {
                            props.explodeSixes = true;
                            parts.addUniquePart('SR5.PushTheLimit', actor.getEdge().max);
                            await actor.update({
                                'data.attributes.edge.value': actor.data.data.attributes.edge.value - 1,
                            });
                        }

                        props.parts = parts.list;
                        const r = this.basicRoll({
                            ...props,
                        });

                        if (extended && r) {
                            const currentExtended = parts.getPartValue('SR5.Extended') ?? 0;
                            parts.addUniquePart('SR5.Extended', currentExtended - 1);
                            props.parts = parts.list;
                            // add a bit of a delay to roll again
                            setTimeout(() => this.advancedRoll(props), 400);
                        }
                        resolve(r);
                        if (after && r) r.then((roll) => after(roll));
                    },
                }).render(true);
            });
        });
    }
}
