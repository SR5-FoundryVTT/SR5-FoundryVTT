import { DataDefaults } from "../data/DataDefaults";
import { SuccessTest, SuccessTestData, TestOptions } from "./SuccessTest";
import { ModifiableValue } from '../mods/ModifiableValue';
import { AlchemyRules } from '../rules/AlchemyRules';
import { SpellcastingRules } from '../rules/SpellcastingRules';
import { DrainRules } from '../rules/DrainRules';
import { DamageType, MinimalActionType } from "../types/item/Action";
import { DeepPartial } from "fvtt-types/utils";
import { SR5Item } from "../item/SR5Item";
import ModifierTypes = Shadowrun.ModifierTypes;


export interface PreparationCreationTestData extends SuccessTestData {
    // Force the preparation is created at, as described on SR5#304.
    force: number
    // Drams of reagents spent, which replace force as the limit. SR5#305, SR5#316.
    reagents: number
    // Trigger releasing the spell later on, as described on SR5#305.
    trigger: string
    // Countdown in seconds for the time trigger only.
    triggerTime: number

    // Net hits over the opposing force roll, as described on SR5#305.
    potency: number

    // Drain value as described on SR5#305 'Step 6: Resist Drain'.
    drain: number
    drainDamage: DamageType

    // Determine that the opposing force roll concluded and drain is ready to be cast.
    drainReady: boolean
}

/**
 * Creating an alchemical preparation as described on SR5#304-305.
 *
 * The alchemist rolls Alchemy + Magic [Force] opposed by the preparation's own force, and the net
 * hits become its potency. Drain is owed either way, so it's cast from the opposing test rather
 * than from here, the same way ritual spellcasting handles it.
 *
 * NOTE: This test is cast from a spell item, while it creates a preparation item.
 */
export class PreparationCreationTest extends SuccessTest<PreparationCreationTestData> {
    public override item: SR5Item<'spell'> | undefined = undefined;

    override _prepareData(data: DeepPartial<PreparationCreationTestData>, options: Partial<TestOptions>): PreparationCreationTestData {
        const prepared = super._prepareData(data, options);

        prepared.force = Math.max(prepared.force || 1, 1);
        prepared.reagents ||= 0;
        prepared.trigger ||= 'command';
        prepared.triggerTime ||= 0;
        prepared.potency ||= 0;
        prepared.drain ||= 0;
        prepared.drainDamage ||= DataDefaults.createData('damage');
        prepared.drainReady ||= false;

        return prepared as PreparationCreationTestData;
    }

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/preparation-creation-test-dialog.hbs';
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/success-test-message.hbs';
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    /**
     * Drain is configured here but will be executed within the opposing tests context, as it's
     * owed even when the preparation fails. SR5#305.
     */
    override get autoExecuteFollowupTest() {
        return false;
    }

    static override _getDefaultTestAction(): DeepPartial<MinimalActionType> {
        return { skill: 'alchemy', attribute: 'magic' };
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['alchemy'];
    }

    override get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'background_count'];
    }

    override async prepareDocumentData() {
        this.prepareInitialForceValue();
        await super.prepareDocumentData();
    }

    /**
     * Set a force value based on the items history or viable suggestions.
     */
    prepareInitialForceValue() {
        if (!this.item) return;

        const lastUsedForce = this.item.getLastSpellForce();
        const suggestedForce = SpellcastingRules.calculateMinimalForce(this.item.system.drain || 0);
        this.data.force = lastUsedForce.value || suggestedForce;
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareLimitValue();
    }

    /**
     * Force is the limit, unless reagents were spent, in which case the drams are. SR5#305, SR5#316.
     */
    prepareLimitValue() {
        const force = Number(this.data.force);
        const reagents = Number(this.data.reagents);

        const label = SpellcastingRules.limitIsReagentInsteadOfForce(reagents) ? 'SR5.Reagent' : 'SR5.Force';
        const limit = new ModifiableValue(this.data.limit);

        // Reagents replace Force as the limit. Remove both possible previous entries because this
        // method runs before and after the dialog, where the selected source can change.
        limit.remove('SR5.Force');
        limit.remove('SR5.Reagent');
        limit.addUniqueBase(label, SpellcastingRules.calculateLimit(force, reagents));
    }

    override calculateBaseValues() {
        super.calculateBaseValues();
        this.calculateDrainValue();
    }

    /**
     * Precalculate drain for user display.
     */
    calculateDrainValue() {
        const force = Number(this.data.force);
        const spellDrain = Number(this.item?.system.drain || 0);
        this.data.drain = AlchemyRules.drainValue(force, spellDrain, this.data.trigger);
    }

    /**
     * The uninterrupted crafting time the alchemist must spend before this test is rolled.
     *
     * Display only, the system doesn't advance world time for it. SR5#305.
     */
    get craftingTimeLabel(): string {
        const minutes = AlchemyRules.craftingMinutes(Number(this.data.force));
        return game.i18n.format('SR5.Preparation.CraftingTimeMinutes', { minutes });
    }

    /**
     * Don't abort execution, as there might be reasons users want to allow 'invalid' values.
     */
    override validateBaseValues() {
        this.warnAboutInvalidForce();
    }

    warnAboutInvalidForce() {
        if (!this.actor) return;

        const force = Number(this.data.force);
        const magic = this.actor.getAttribute('magic').value;

        if (!AlchemyRules.validForce(force, magic)) {
            ui.notifications?.warn('SR5.Warnings.PreparationForceTooHigh', { localize: true });
        }
    }

    /**
     * Derive potency and drain damage from the opposing force roll.
     *
     * NOTE: This will be called by the opposing test via a follow up test action.
     */
    calcDrain(opposingHits: number) {
        if (!this.actor) return;

        this.data.potency = Math.max(this.hits.value - opposingHits, 0);

        const magic = this.actor.getAttribute('magic').value;
        this.data.drainDamage = DrainRules.calcDrainDamage(this.data.drain, magic, this.hits.value);
        this.data.drainReady = true;

        this.warnAboutInvalidTriggerTime();
    }

    /**
     * A time trigger can't be set further out than the resulting potency in hours. SR5#305.
     */
    warnAboutInvalidTriggerTime() {
        if (this.data.trigger !== 'time') return;
        if (AlchemyRules.validTriggerTime(Number(this.data.triggerTime), this.data.potency)) return;

        ui.notifications?.warn('SR5.Warnings.PreparationTriggerTimeTooLong', { localize: true });
    }

    /**
     * Allow the currently used force value of this spell item to be reused next time.
     */
    override async saveUserSelectionAfterDialog() {
        if (!this.item) return;

        await this.item.setLastSpellForce({ value: this.data.force, reckless: false });
    }
}
