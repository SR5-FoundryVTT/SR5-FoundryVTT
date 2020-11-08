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
    TargetChatMessageOptions
} from '../chat';
import {DEFAULT_ROLL_NAME, FLAGS, SR, SYSTEM_NAME} from '../constants';
import { PartsList } from '../parts/PartsList';
import {ActionTestData} from "../apps/dialogs/ShadowrunItemDialog";
import BlastData = Shadowrun.BlastData;
import FireModeData = Shadowrun.FireModeData;
import DrainData = Shadowrun.DrainData;
import {ShadowrunTestDialog} from "../apps/dialogs/ShadowrunTestDialog";

// TODO: Split up BasicRollProps into the different types of calls
// item, actor, dicePool, attack, defense, spell, form
export type Test =  {
    label: string;
    type: string;
}

interface RollProps {
    parts?: ModList<number>,
    limit?: any,
    explodeSixes?: boolean
}

export interface BasicRollProps {
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

/** Provide a clear interface of which value are guaranteed to be defined.
     */
export interface BasicRollPropsDefaulted extends BasicRollProps {
    title: string
    parts: ModList<number>
    explodeSixes: boolean
    hideRollMessage: boolean
    previewTemplate: boolean
    rollMode: keyof typeof CONFIG.Dice.rollModes
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

/** Provide a clear interface of which value are guaranteed to be defined.
     */
export interface AdvancedRollPropsDefaulted extends AdvancedRollProps {
    parts: ModList<number>;
    wounds: boolean;
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
        // Create common data for all item types.
        const rollData = {
            ...options,
            event: event,
            dialogOptions: {
                environmental: true,
            },
            item,
            actor: item.actor,
            parts: item.getRollPartsList(),
            limit: item.getLimit(),
            title: item.getRollName(),
            previewTemplate: item.hasTemplate,
            attack:  item.getAttackData(0, actionTestData),
            blast: item.getBlastData(actionTestData),
            description: item.getChatData()
        } as AdvancedRollProps;

        // Add item type specific data.
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
        // Add target specific data.
        if (actionTestData && actionTestData.targetId) {
            rollData.target = Helpers.getToken(actionTestData.targetId);
        }

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

    static roll(props: RollProps): ShadowrunRoll|undefined {
        const parts = new PartsList(props.parts);

        if (parts.isEmpty || parts.total < 1) {
            ui.notifications.error(game.i18n.localize('SR5.RollOneDie'));
            return
        };

        // Prepare SR Success Test with foundry formula.
        const formulaOptions = { parts: parts.list, limit: props.limit, explode: props.explodeSixes };
        const formula = this.shadowrunFormula(formulaOptions);
        if (!formula) {
            return;
        }

        // Execute the Success Test.
        const rollData = {parts: parts.list, limit: props.limit, explodeSixes: props.explodeSixes};
        const roll = new ShadowrunRoll(formula, rollData);

        // Return roll reference instead roll() return to avoid typing issues.
        roll.roll();
        return roll;
    }

    static async basicRoll(basicProps: BasicRollProps): Promise<ShadowrunRoll | undefined> {
        const props = ShadowrunRoller.basicRollPropsDefaults(basicProps);

        const roll = await ShadowrunRoller.roll({parts: props.parts, limit: props.limit, explodeSixes: props.explodeSixes});
        if (!roll) return;

        if (!props.hideRollMessage) {
            await ShadowrunRoller.rollChatMessage(roll, props);
        }

        return roll;
    }

    /** Provide a clear interface of which value are guaranteed to be defined.
     */
    static basicRollPropsDefaults(props: BasicRollProps): BasicRollPropsDefaulted {
        props.title = props.title ?? DEFAULT_ROLL_NAME;
        props.parts = props.parts ?? [];
        props.explodeSixes = props.explodeSixes ?? false;
        props.hideRollMessage = props.hideRollMessage ?? false;
        props.rollMode = props.rollMode ?? CONFIG.Dice.rollModes.roll;
        props.previewTemplate = props.previewTemplate ?? false;

        return {...props} as BasicRollPropsDefaulted;
    }

    /** Provide a clear interface of which value are guaranteed to be defined.
     */
    static advancedRollPropsDefaults(props: AdvancedRollProps): AdvancedRollPropsDefaulted {
        props.parts = props.parts ?? [];
        props.wounds = props.wounds ?? true;

        return {...props} as AdvancedRollPropsDefaulted;
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
     */
    static async advancedRoll(advancedProps: AdvancedRollProps): Promise<ShadowrunRoll | undefined> {
        // Remove after roll callback as to not move it further into other function calls.
        const {after} = advancedProps;

        const props = ShadowrunRoller.advancedRollPropsDefaults(advancedProps);

        // remove limits if game settings is set
        if (!game.settings.get(SYSTEM_NAME, FLAGS.ApplyLimits)) {
            delete props.limit;
        }

        // Ask user for additional, general success test role modifiers.
        const testDialogOptions = {
            title: props.title,
            dialogOptions: props.dialogOptions,
            extended: props.extended,
            limit: props.limit,
            wounds: props.wounds,
        };
        const testDialog = await ShadowrunTestDialog.create(props.actor, testDialogOptions, props.parts);
        const testData = await testDialog.select();

        if (testDialog.canceled) return;


        // Prepare Test Roll.
        const basicRollProps = {...props};
        basicRollProps.wounds = testData.wounds;
        basicRollProps.dialogOptions = testData.dialogOptions;
        basicRollProps.rollMode = testData.rollMode;

        if (testDialog.selectedButton === 'edge' && props.actor) {
            basicRollProps.explodeSixes = true;
            testData.parts.addUniquePart('SR5.PushTheLimit', props.actor.getEdge().value);
            delete basicRollProps.limit;
            // TODO: Edge usage doesn't seem to apply on actor sheet.
            await props.actor.update({
                'data.attributes.edge.uses': props.actor.data.data.attributes.edge.uses - 1,
            });
        }

        basicRollProps.parts = testData.parts.list;

        // Execute Test roll...
        const roll = await this.basicRoll(basicRollProps);
        if (!roll) return;

        // @ts-ignore // Token.actor is of type Actor instead of SR5Actor
        if (!props.hideRollMessage && props.target && props.target.actor.hasActivePlayer()) {
            await ShadowrunRoller.targetChatMessage(props);
        }

        if (testData.extended) {
            const currentExtended = testData.parts.getPartValue('SR5.Extended') ?? 0;
            testData.parts.addUniquePart('SR5.Extended', currentExtended - 1);

            // Prepare the next, extended test roll.
            props.parts = testData.parts.list;
            props.extended = true;
            const delayInMs = 400;
            setTimeout(() => this.advancedRoll(props), delayInMs);
        }

        if (after) await after(roll);

        return roll;
    }

    static async rollChatMessage(roll: ShadowrunRoll, props: BasicRollPropsDefaulted) {
        const {actor, target, item, rollMode, description, title, previewTemplate, attack, incomingAttack, incomingDrain, incomingSoak, tests} = props;
        const rollChatMessageOptions = {roll, actor, target, item, rollMode, description, title, previewTemplate, attack, incomingAttack, incomingDrain, incomingSoak, tests};
        await createRollChatMessage(rollChatMessageOptions);
    }

    static async targetChatMessage(props: AdvancedRollPropsDefaulted) {
        // @ts-ignore // Token.actor is of type Actor instead of SR5Actor
        const user = props.target.actor.getActivePlayer();

        const targetChatMessage = {actor: props.actor, target: props.target, item: props.item,
            incomingAttack: props.incomingAttack, tests: props.tests, whisperTo: user
        } as TargetChatMessageOptions;
        await createTargetChatMessage(targetChatMessage);
    }
}
