import ModList = Shadowrun.ModList;
import RollEvent = Shadowrun.RollEvent;
import BaseValuePair = Shadowrun.BaseValuePair;
import LabelField = Shadowrun.LabelField;
import AttackData = Shadowrun.AttackData;
import DamageData = Shadowrun.DamageData;
import { Helpers } from '../helpers';
import { SR5Actor } from '../actor/SR5Actor';
import { SR5Item } from '../item/SR5Item';
import {
    createRollChatMessage, createTargetChatMessage,
    ifConfiguredCreateDefaultChatMessage, TargetChatMessageOptions
} from '../chat';
import {CORE_FLAGS, CORE_NAME, DEFAULT_ROLL_NAME, FLAGS, SR, SYSTEM_NAME} from '../constants';
import { PartsList } from '../parts/PartsList';
import {ActionTestData} from "../apps/dialogs/ShadowrunItemDialog";
import BlastData = Shadowrun.BlastData;
import FireModeData = Shadowrun.FireModeData;
import DrainData = Shadowrun.DrainData;

// TODO: Split up BasicRollProps into the different types of calls
// item, actor, dicePool, attack, defense, spell, form
export type Test =  {
    label: string;
    type: string;
}

export interface BasicRollProps {
    name?: string;
    img?: string;
    parts?: ModList<number>;
    limit?: BaseValuePair<number> & LabelField;
    explodeSixes?: boolean;
    title?: string;
    actor?: SR5Actor;
    target?: Token;
    item?: SR5Item;
    // Personal attack
    attack?: AttackData
    // Incoming attack for a defense test
    incomingAttack?: AttackData;
    incomingDrain?: DrainData;
    incomingSoak?: DamageData;
    tests?: Test[];
    description?: object;
    previewTemplate?: boolean;
    hideRollMessage?: boolean;
    rollMode?: keyof typeof CONFIG.Dice.rollModes;
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
    attack?: AttackData;
    blast?: BlastData;
    reach?: number
    fireMode?: FireModeData
}

type ShadowrunRollData = {
    limit: number
    threshold: number
    parts: ModList<number>
    explodeSixes: boolean
}
export class ShadowrunRoll extends Roll {
    data: ShadowrunRollData
    // add class Roll to the json so dice-so-nice works
    toJSON(): any {
        const data = super.toJSON();
        data.class = 'Roll';
        return data;
    }

    get sides(): number[] {
        //@ts-ignore
        // 0.7.x foundryVTT
        if (this.terms) {
            //@ts-ignore
            return this.terms[0].results.map(result => result.result);
        }

        //@ts-ignore
        // 0.6.x foundryVTT
        return this.parts[0].rolls.map(roll => roll.roll);
    }

    get limit(): number {
        return this.data.limit;
    }

    get threshold(): number {
        return this.data.threshold;
    }

    get parts(): ModList<number> {
        return this.data.parts;
    }

    get explodeSixes(): boolean {
        return this.data.explodeSixes;
    }

    count(side: number): number {
        const results = this.sides;
        return results.reduce((counted, result) => result === side ? counted + 1 : counted, 0);
    }

    get hits(): number {
        return this.total;
    }

    get pool(): number {
        //@ts-ignore
        // 0.7.x foundryVTT
        if (this.terms) {
            //@ts-ignore
            return this.dice[0].number;
        }

        //@ts-ignore
        // 0.6.x foundryVTT
        return this.parts[0].rolls.length;
    }

    get glitched(): boolean {
        let glitched = 0;
        SR.die.glitch.forEach(die => glitched += this.count(die));
        return glitched > Math.floor(this.pool / 2);
    }
}

export class ShadowrunRoller {
    static itemRoll(event, item: SR5Item, options?: Partial<AdvancedRollProps>, actionTestData?: ActionTestData): Promise<ShadowrunRoll | undefined> {
        const parts = item.getRollPartsList();
        let limit = item.getLimit();
        let title = item.getRollName();

        const rollData = {
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
            attack:  item.getAttackData(0, actionTestData),
            blast: item.getBlastData(actionTestData)
        } as AdvancedRollProps;

        if (item.hasOpposedRoll) {
            rollData.tests = item.getOpposedTests();
        }
        if (item.isMeleeWeapon()) {
            rollData.reach = item.getReach();
        }
        if (item.isRangedWeapon() && actionTestData?.rangedWeapon) {
            if (rollData.dialogOptions) {
                rollData.dialogOptions.environmental = actionTestData.rangedWeapon.environmental.range;
            }
        }
        if (actionTestData && actionTestData.targetId) {
            rollData.target = Helpers.getToken(actionTestData.targetId);
        }

        rollData.description = item.getChatData();

        return ShadowrunRoller.advancedRoll(rollData);
    }

    static async resultingItemRolls(event, item: SR5Item, actionTestData? : ActionTestData) {
        // Cast resulting tests from above Success Test depending on item type.
        if (item.isComplexForm() && actionTestData?.complexForm) {
            const level = actionTestData.complexForm.level;
            const fade = item.getFade() + level;
            const minFade = 2;
            const totalFade = Math.max(fade, minFade);
            await item.actor.rollFade({ event }, totalFade);
        }
        else if (item.isSpell()) {
            // if (item.isCombatSpell() && roll) {
            //     // TODO: isCombatSpell and roll does something but isn't handled.
            // }
            if (actionTestData?.spell) {
                const force = actionTestData.spell.force;
                const reckless = actionTestData.spell.reckless;
                const drain = item.getDrain() + force + (reckless ? 3 : 0);
                const minDrain = 2;
                const totalDrain = Math.max(drain, minDrain);

                await item.actor.rollDrain({ event }, totalDrain);
            }
        }
        else if (item.isWeapon()) {
            if (item.hasAmmo() && actionTestData?.rangedWeapon) {
                const fireMode = actionTestData.rangedWeapon.fireMode.value || 1;
                await item.useAmmo(fireMode);
            }
        }
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
        actor,
        item,
        title = DEFAULT_ROLL_NAME,
        img = actor?.img,
        name = actor?.name,
        parts: partsProps = [],
        limit,
        explodeSixes = false,
        hideRollMessage = false,
        rollMode = CONFIG.Dice.rollModes.roll,
        previewTemplate = false,
        description,
        attack,
        incomingAttack,
        incomingDrain,
        incomingSoak,
        target,
        tests,
        ...props
    }: BasicRollProps): Promise<ShadowrunRoll | undefined> {
        const parts = new PartsList(partsProps);

        // Abort on nothing to roll.
        if (parts.isEmpty) {
            return;
        }

        // Prepare SR Success Test with foundry formula.
        const formula = this.shadowrunFormula({ parts: parts.list, limit, explode: explodeSixes });
        if (!formula) {
            return
        }

        // Execute the Success Test.
        const rollData = {limit, explodeSixes, parts: parts.list};
        const roll = new ShadowrunRoll(formula, rollData);
        roll.roll();

        await ifConfiguredCreateDefaultChatMessage(roll, {actor, title, rollMode});

        // NOTE: Keep template data extraction to see basicProps that come through unused.
        const templateData = {
            // tokenId: tokenSceneId,
            actor, token: actor?.token, target, header: {name: name || '', img: img || '',}, title, description, rollMode, limit, previewTemplate,
            attack, incomingAttack, incomingDrain, incomingSoak, item, tests, ...props, roll};
        console.warn('basicProps unused', props);



        if (!hideRollMessage) {
            const rollChatMessageOptions = {roll, actor, target, item, name, img, rollMode, description, title, previewTemplate, attack, incomingAttack, incomingDrain, incomingSoak, tests};
            await createRollChatMessage(rollChatMessageOptions);
        }

        if (target) {
            console.error('target', target);
            for (const user of game.users.entities) {
                 if (!user.character) {
                    continue;
                }

                console.error(user.character.id === target.actor.id);
                const targetChatMessage = {
                    actor,
                    target: {
                        user, token: target
                    },
                    item,
                    incomingAttack,
                    tests
                } as TargetChatMessageOptions;
                await createTargetChatMessage(targetChatMessage);

            }
        }

        return roll;
    }

    /**
     * Prompt a roll for the user
     */
    static promptRoll(): Promise<ShadowrunRoll | undefined> {
        const lastRoll = game.user.getFlag(SYSTEM_NAME, 'lastRollPromptValue') || 0;
        const parts = [{ name: 'SR5.LastRoll', value: lastRoll }];
        const advancedRollProps = { parts, title: 'Roll', dialogOptions: { prompt: true } } as AdvancedRollProps;
        return ShadowrunRoller.advancedRoll(advancedRollProps);
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
        if (!game.settings.get(SYSTEM_NAME, FLAGS.ApplyLimits)) {
            delete props.limit;
        }

        // TODO create "fast roll" option

        const rollMode = game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);

        let dialogData = {
            options: dialogOptions,
            extended,
            dice_pool: parts.total,
            parts: parts.getMessageOutput(),
            limit: limit?.value,
            wounds,
            woundValue: actor?.getWoundModifier(),
            rollMode,
            rollModes: CONFIG.Dice.rollModes,
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
                label: `${game.i18n.localize('SR5.PushTheLimit')} (+${actor.getEdge().value})`,
                icon: '<i class="fas fa-bomb"></i>',
                callback: () => {
                    edge = true;
                    cancel = false;
                },
            };
        }

        return new Promise(async (resolve) => {
            const content = await renderTemplate(template, dialogData);
            const dialog = new Dialog({
                title: title,
                content,
                buttons,
                default: 'roll',

                close: async (html) => {
                    if (cancel) return;
                    // get the actual dice_pool from the difference of initial parts and value in the dialog

                    const dicePoolValue = Helpers.parseInputToNumber($(html).find('[name="dice_pool"]').val());

                    if (dialogOptions?.prompt) {
                        parts.clear();
                        await game.user.setFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue, dicePoolValue);
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
                        parts.addUniquePart('SR5.PushTheLimit', actor.getEdge().value);
                        delete props.limit;
                        // TODO: Edge usage doesn't seem to apply on actor sheet.
                        await actor.update({
                            'data.attributes.edge.uses': actor.data.data.attributes.edge.uses - 1,
                        });
                    }

                    props.rollMode = Helpers.parseInputToString($(html).find('[name=rollMode]').val());

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
            });
            dialog.render(true);
        });
    }
}
