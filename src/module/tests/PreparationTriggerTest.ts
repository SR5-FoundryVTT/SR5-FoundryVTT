import { SpellCastingTest, SpellCastingTestData } from "./SpellCastingTest";
import { TestOptions } from "./SuccessTest";
import { ModifiableValue } from "../mods/ModifiableValue";
import { AlchemyRules } from "../rules/AlchemyRules";
import { DataDefaults } from "../data/DataDefaults";
import { MinimalActionType } from "../types/item/Action";
import { DeepPartial } from "fvtt-types/utils";
import { SR5Item } from "../item/SR5Item";
import ModifierTypes = Shadowrun.ModifierTypes;


export interface PreparationTriggerTestData extends SpellCastingTestData {
    // Potency at the moment of triggering, which stands in for the Spellcasting skill. SR5#306.
    potency: number
    // Timed preparations resolve at their scheduled instant even when world time advances past it
    // in one large step. Manual triggers leave this unset and use the current world time.
    triggeredWorldTime?: number
}

/**
 * Triggering an alchemical preparation as described on SR5#305-306 'Using a Preparation'.
 *
 * The preparation rolls for itself: Force + Potency [Force]. There's no drain, since the alchemist
 * already paid it at creation, and no Edge may be spent.
 *
 * Extending SpellCastingTest is deliberate. It keeps `data.force` in the test data and the spell
 * fields on the item, which is all the combat spell defense and resist chain needs to run
 * unchanged against a triggered preparation.
 */
export class PreparationTriggerTest extends SpellCastingTest {
    declare data: PreparationTriggerTestData;
    // A preparation carries the same spell fields a spell item does. See SR5Item#spellPart.
    public declare item: SR5Item<'preparation'> | undefined;

    override _prepareData(data: DeepPartial<PreparationTriggerTestData>, options: Partial<TestOptions>): PreparationTriggerTestData {
        const prepared = super._prepareData(data as DeepPartial<SpellCastingTestData>, options) as PreparationTriggerTestData;

        prepared.potency ||= 0;
        // Drain was paid when the preparation was created. SR5#306.
        prepared.drain = 0;
        prepared.drainDamage = DataDefaults.createData('damage');
        if (prepared.action?.followed) prepared.action.followed.test = '';

        return prepared;
    }

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/preparation-trigger-test-dialog.hbs';
    }

    static override _getDefaultTestAction(): DeepPartial<MinimalActionType> {
        // The preparation rolls its own force and potency, not the triggering actor's skills.
        return {};
    }

    /**
     * A preparation isn't affected by the wound or background count modifiers of whoever set it
     * off, it rolls entirely on its own values.
     */
    override get testModifiers(): ModifierTypes[] {
        return [];
    }

    /**
     * No Edge may be spent on a preparation's spellcasting. SR5#306.
     */
    override get canSecondChance(): boolean {
        return false;
    }

    override get canPushTheLimit(): boolean {
        return false;
    }

    override async prepareDocumentData() {
        this.prepareInitialForceValue();
        await super.prepareDocumentData();
    }

    /**
     * Force and potency both come from the preparation, never from user input.
     */
    override prepareInitialForceValue() {
        if (!this.item) return;

        this.data.force = this.item.system.force;
        const worldTime = this.data.triggeredWorldTime ?? game.time.worldTime;
        this.data.potency = AlchemyRules.currentPotency(
            this.item.system.potency.base,
            this.item.system.created.worldTime,
            worldTime
        );
    }

    /**
     * An area preparation is centered on the preparation itself, with a radius of its Potency in
     * meters instead of the spell's Force. SR5#306.
     */
    override getBlastData() {
        if (!this.item?.isAreaOfEffect()) return undefined;

        return {
            radius: Number(this.data.potency),
            dropoff: 0,
        };
    }

    /** A preparation without remaining potency cannot cast again. */
    override userCanExecute(): boolean {
        if (!super.userCanExecute()) return false;
        if (this.item && this.data.potency > 0) return true;

        ui.notifications?.warn('SR5.Warnings.PreparationDepleted', { localize: true });
        return false;
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        this.applyPreparationPool();
    }

    /**
     * The preparation rolls Force + Potency, replacing anything the triggering actor would add.
     * SR5#306, SG#210.
     */
    applyPreparationPool() {
        const pool = new ModifiableValue(this.data.pool);
        pool.remove('SR5.Force');
        pool.remove('SR5.Preparation.Potency');
        pool.addBase('SR5.Force', Number(this.data.force));
        pool.addBase('SR5.Preparation.Potency', Number(this.data.potency));
    }

    /**
     * Force is always the limit. Reagents spent during creation don't apply here. SG#210.
     */
    override prepareLimitValue() {
        ModifiableValue.addUniqueBase(this.data.limit, 'SR5.Force', Number(this.data.force));
    }

    /**
     * A preparation causes no drain when triggered. SR5#306.
     */
    override calculateDrainValue() {
        this.data.drain = 0;
    }

    override calcDrainDamage() {
        this.data.drainDamage = DataDefaults.createData('damage');
        return this.data.drainDamage;
    }

    /**
     * Nothing follows a trigger, the alchemist already resisted this preparation's drain.
     */
    override get autoExecuteFollowupTest() {
        return false;
    }

    /**
     * Don't write a last used force back onto the preparation, its force is fixed at creation.
     */
    override async saveUserSelectionAfterDialog() { }

    /**
     * A preparation is single use. Once triggered, the spell is released either way. SG#209.
     */
    override async afterTestComplete() {
        await super.afterTestComplete();
        await this.consumePreparation();
    }

    /**
     * Mark the preparation spent rather than deleting it, the lynchpin object still exists.
     */
    async consumePreparation() {
        if (!this.item) return;
        if (this.item.system.potency.base <= 0) return;

        await this.item.update({ system: { potency: { base: 0, value: 0 } } });
    }
}
