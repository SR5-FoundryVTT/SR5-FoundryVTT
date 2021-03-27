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
    createRollChatMessage, createTargetChatMessage, RollTargetChatMessage,
    TargetChatMessageOptions
} from '../chat';
import {CORE_FLAGS, CORE_NAME, DEFAULT_ROLL_NAME, FLAGS, SR, SYSTEM_NAME} from '../constants';
import { PartsList } from '../parts/PartsList';
import {ActionTestData} from "../apps/dialogs/ShadowrunItemDialog";
import BlastData = Shadowrun.BlastData;
import FireModeData = Shadowrun.FireModeData;
import DrainData = Shadowrun.DrainData;
import {ShadowrunTestDialog} from "../apps/dialogs/ShadowrunTestDialog";
import ModifiedDamageData = Shadowrun.ModifiedDamageData;
import LimitField = Shadowrun.LimitField;
import CombatData = Shadowrun.CombatData;

// item, actor, dicePool, attack, defense, spell, form
export type Test =  {
    label: string;
    type: string;
}

export interface TestDialogData {
    parts: PartsList<number>
    limit: number
    wounds: boolean
    extended: boolean
    rollMode: keyof typeof CONFIG.Dice.rollModes;
}

interface RollProps {
    parts?: ModList<number>,
    limit?: any,
    explodeSixes?: boolean
}

// TODO: Separate into 'roll data' and 'template data', which only passes through but isn't used.
export interface BasicRollProps {
    parts?: ModList<number>;
    limit?: LimitField;
    explodeSixes?: boolean;
    title?: string;
    actor?: SR5Actor;
    target?: Token;
    item?: SR5Item;
    // Personal attack
    attack?: AttackData
    // Incoming attack for a defense test
    incomingAttack?: AttackData;
    damage?: ModifiedDamageData;
    tests?: Test[];
    description?: object;
    previewTemplate?: boolean;
    hideRollMessage?: boolean;
    rollMode?: keyof typeof CONFIG.Dice.rollModes;
    combat?: CombatData
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
    environmental?: number
    pool?: boolean
    extended?: boolean
    limit?: boolean
    wounds?: boolean
}

export interface AdvancedRollProps extends BasicRollProps {
    event?: RollEvent;
    extended?: boolean;
    wounds?: boolean;
    after?: (roll: Roll | undefined) => void;
    attack?: AttackData;
    fireMode?: FireModeData
    combat?: CombatData
}

/** Provide a clear interface of which value are guaranteed to be defined.
     */
export interface AdvancedRollPropsDefaulted extends AdvancedRollProps {
    parts: ModList<number>
    wounds: boolean
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
    static async itemRoll(event, item: SR5Item, actionTestData?: ActionTestData): Promise<ShadowrunRoll | undefined> {
        // Create common data for all item types.
        const title = item.getRollName();
        const actor = item.actor;
        const attack =  item.getAttackData(0, actionTestData);
        const parts = item.getRollPartsList();
        const limit = item.getLimit();
        const extended = item.getExtended();
        const previewTemplate = item.hasTemplate;
        const description = item.getChatData();
        const tests = item.getOpposedTests();
        const modifiers = await actor.getModifiers();

        // Prepare the roll and dialog.
        const advancedRollProps = {
            hideRollMessage: true,
            event: event,
            actor,
            parts,
            limit,
            extended,
            tests
        } as AdvancedRollProps;


        // Reset dialog options to default values and set each according to item types.
        const advancedDialogOptions = {
            environmental: 0,
        } as RollDialogOptions;
        if (item.applyEnvironmentalModifiers()) {
            advancedDialogOptions.environmental = modifiers.environmental.total;
        }

        const roll = await ShadowrunRoller.advancedRoll(advancedRollProps, advancedDialogOptions);

        if (!roll) return;

        if (attack) {
            attack.hits = roll.hits;
        }

        // TODO: Separation of concerns. 'Roller' should only roll and prepare to roll.
        //       Rules should be handled elsewhere. Attack Handler? Ranged, Melee, DirectSpell, IndirectSpell...
        if (attack && item.isCombatSpell()) {
            const spellAttack = item.getAttackData(roll.hits, actionTestData);
            if (spellAttack) attack.damage = spellAttack.damage;
        }


        // Handle user targeting for for targeted messages and display.
        const targets: Token[] = Helpers.getUserTargets();
        // Allow for direct defense without token selection for ONE token targeted.
        const target = targets.length === 1 ? targets[0] : undefined;

        const rollChatOptions = {title, roll, actor, item, attack, previewTemplate, targets, target, description, tests};
        await createRollChatMessage(rollChatOptions);

        if (tests) {
            const targetChatOptions = {actor, item, tests, roll, attack}
            await ShadowrunRoller.targetsChatMessages(targets, targetChatOptions);
        }

        return roll;
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
            ui.notifications.warn(game.i18n.localize('SR5.RollOneDie'));
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
        const value = game.user?.getFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue) || 0;
        const parts = [{ name: 'SR5.LastRoll', value }];
        const advancedRollProps = { parts, title: game.i18n.localize("SR5.Test")} as AdvancedRollProps;
        const dialogOptions = { pool: true }
        return ShadowrunRoller.advancedRoll(advancedRollProps, dialogOptions);
    }

    /**
     * Start an advanced roll
     * - Prompts the user for modifiers
     */
    static async advancedRoll(advancedProps: AdvancedRollProps, dialogOptions?: RollDialogOptions): Promise<ShadowrunRoll | undefined> {
        // Remove after roll callback as to not move it further into other function calls.
        const {after} = advancedProps;

        const props = ShadowrunRoller.advancedRollPropsDefaults(advancedProps);

        // remove limits if game settings is set
        if (!game.settings.get(SYSTEM_NAME, FLAGS.ApplyLimits)) {
            delete props.limit;
        } else {
            ShadowrunRoller._errorOnInvalidLimit(props.limit);
        }

        // Ask user for additional, general success test role modifiers.
        const testDialogOptions = {
            title: props.title,
            dialogOptions,
            extended: props.extended,
            limit: props.limit,
            wounds: props.wounds,
        };

        const testDialog = await ShadowrunTestDialog.create(props.actor, testDialogOptions, props.parts);
        const testData = await testDialog.select();

        if (testDialog.canceled) return;


        // Prepare Test Roll.
        const basicRollProps = {...props} as BasicRollPropsDefaulted;
        // basicRollProps.wounds = testData.wounds;
        // basicRollProps.dialogOptions = testData.dialogOptions;
        basicRollProps.rollMode = testData.rollMode;
        // TODO: This is needed a hotfix... basicRoll is used secondChance and pushTheLimit chat actions.
        //       If those are handled by advancedRoll (without a dialog) basicRoll message creation can be removed
        //       and this line as well...
        basicRollProps.hideRollMessage = true;


        if (testDialog.selectedButton === 'edge' && props.actor) {
            await ShadowrunRoller.handleExplodingSixes(props.actor, basicRollProps, testData);
        }

        // Build basic roll parts as the LAST step, to avoid missing any parts.
        basicRollProps.parts = testData.parts.list;

        // Execute Test roll...
        const roll = await this.basicRoll(basicRollProps);
        if (!roll) return;


        if (!props.hideRollMessage) {
            await ShadowrunRoller.rollChatMessage(roll, basicRollProps);
        }


        if (testData.extended) {
            ShadowrunRoller.handleExtendedRoll(props, testData);
        }


        // Call any provided callbacks to be executed after this roll.
        if (after) await after(roll);

        return roll;
    }

    static async rollChatMessage(roll: ShadowrunRoll, props: BasicRollPropsDefaulted) {
        const {actor, target, item, rollMode, description, title, previewTemplate, attack, incomingAttack, damage, tests, combat} = props;
        const rollChatMessageOptions = {roll, actor, target, item, rollMode, description, title, previewTemplate, attack, incomingAttack, damage, tests, combat};
        await createRollChatMessage(rollChatMessageOptions);
    }

    /** Send a message to the specific targeted player given.
     *
     * Use targetsChatMessages for a simple way to send to all active player targets.
     *
     * Should a target have multiple user owners, each will get a message.
     *
     * @param options
     */
    static async targetChatMessage(options: RollTargetChatMessage) {
        if (!game.settings.get(SYSTEM_NAME, FLAGS.WhisperOpposedTestsToTargetedPlayers)) return;

        const rollMode = options.rollMode ?? game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);
        if (rollMode === 'roll') return;

        // @ts-ignore // Token.actor is of type Actor instead of SR5Actor
        const users = options.target.actor.getActivePlayerOwners();

        for (const user of users) {
            if (user.isGM) continue;
            if (user === game.user) continue;

            const targetChatMessage = {
                actor: options.actor, target: options.target, targets: [options.target], item: options.item,
                tests: options.tests, whisperTo: user, attack: options.attack
            } as TargetChatMessageOptions;
            await createTargetChatMessage(targetChatMessage);
        }
    }

    /** Send messages to ALL targets, no matter if specifically targeted in a action dialog.
     *
     * This can cause for multiple target whispers to happen, even if the active player only selected one
     * during, for example, the ranged weapon dialog (which gives a selection and returns one)
     *
     *
     * @param options
     */
    static async targetsChatMessages(targets: Token[], options: RollTargetChatMessage) {
        if (!game.settings.get(SYSTEM_NAME, FLAGS.WhisperOpposedTestsToTargetedPlayers)) return;

        targets.forEach(target => {
            // @ts-ignore // Token.actor is of type Actor instead of SR5Actor
            if (!target.actor.hasActivePlayerOwner()) return;

            options = {...options, target};
            ShadowrunRoller.targetChatMessage(options);
        })
    }

    static _errorOnInvalidLimit(limit?: LimitField) {
        if (limit && limit.value < 0) {
            ui.notifications.error(game.i18n.localize('SR5.Warnings.NegativeLimitValue'));
        }
    }

    static handleExtendedRoll(advancedProps: AdvancedRollPropsDefaulted, testData: TestDialogData) {
        const currentExtended = testData.parts.getPartValue('SR5.Extended') ?? 0;
        testData.parts.addUniquePart('SR5.Extended', currentExtended - 1);

        // Prepare the next, extended test roll.
        advancedProps.parts = testData.parts.list;
        advancedProps.extended = true;
        const delayInMs = 400;
        setTimeout(() => this.advancedRoll(advancedProps), delayInMs);
    }

    static async handleExplodingSixes(actor: SR5Actor, basicProps: BasicRollProps, testData: TestDialogData) {
        basicProps.explodeSixes = true;
        delete basicProps.limit;
        testData.parts.addUniquePart('SR5.PushTheLimit', actor.getEdge().value);

        await actor.useEdge();
    }
}
