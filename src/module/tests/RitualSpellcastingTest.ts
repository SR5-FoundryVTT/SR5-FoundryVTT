import { DataDefaults } from "../data/DataDefaults";
import { SuccessTest, SuccessTestData } from "./SuccessTest";
import { PartsList } from '../parts/PartsList';
import { RitualRules } from '../rules/RitualRules';


interface RitualSpellcastingTestData extends SuccessTestData {

    // Force value as described on SR5#300
    force: number
    // Drain value as described on SR5#300
    drain: number
    drainDamage: Shadowrun.DamageData

    // Reagent value as described on SR5#296 'Give the offering'
    reagents: number

    // Determine that ritual concluded and drain is ready to be cast.
    drainReady: boolean
}

/**
 * 
 * NOTE: While we need spell casting data, we don't need general spell casting flow.
 * 
 * Ritual Spellcasting uses the default Success Test, Opposed Test and Followup Flow.
 */
export class RitualSpellcastingTest extends SuccessTest<RitualSpellcastingTestData> {

    override _prepareData(data: any, options: any) {
        data = super._prepareData(data, options);

        this._prepareRitualData(data);

        data.drain = data.drain || 0;
        data.drainDamage = data.drainDamage || DataDefaults.createData('damage');

        return data;
    }

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/ritualspellcasting-test-dialog.html';
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['spell_ritual']
    }

    /**
     * A ritual test can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    /**
     * Drain test is configured here but will be executed within the opposing tests context.
     */
    override get autoExecuteFollowupTest() {
        return false;
    }

    /**
     *
     */
    static override _getDefaultTestAction(): Partial<Shadowrun.MinimalActionData> {
        return {
            skill: 'ritual_spellcasting',
            attribute: 'magic'
        }
    }

    override async prepareDocumentData() {
        this.prepareInitialForceValue();
        await super.prepareDocumentData();
    }

    /**
     * Set a default force value based on the force last used for this ritual.
     * 
     * If ritual hasn't been cast before, fallback to a useable value.
     */
    prepareInitialForceValue() {
        if (!this.item) return;

        const lastUsedForce = this.item.getLastSpellForce();
        this.data.force = lastUsedForce.value || 1;
    }

    /**
     * Rituals uses Force as limit, which needs to be injected into the normal test flow.
     */
    override prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareLimitValue();
        this.prepareReagents();
    }

    /**
     * Validate user input during dialog or creation and inform user about invalid values.
     */
    override validateBaseValues() {
        this.warnAboutInvalidForce();
        this.warnAboutInvalidReagents()
    }

    /**
     * Notify caster about incomplete ritual. To avoid pre mature drain tests.
     */
    override async executeFollowUpTest() {
        if (!this.data.drainReady) {
            ui.notifications?.warn('SR5.Warnings.RitualNotConcluded', {localize: true});
        }
        await super.executeFollowUpTest();
    }

    /**
     * Don't abort execution as there might be some reason users would want to allow 'invalid' values.
     */
    warnAboutInvalidForce() {
        const force = Number(this.data.force);

        //currently we don't check for the lodge, so we always allow it
        if (!RitualRules.validForce(force, force)) {
            ui.notifications?.warn('SR5.Warnings.RitualInvalidForce', {localize: true});
        }
    }

    warnAboutInvalidReagents() {
        const reagents = Number(this.data.reagents);
        const force = Number(this.data.force);

        if (!RitualRules.validReagent(reagents, force)) {
            ui.notifications?.warn('SR5.Warnings.RitualNotEnoughReagents', {localize: true});
        }
    }

    /**
     * Calculate limit based on force selected by user.
     * 
     */
    prepareLimitValue() {
        this.data.limit.mod = PartsList.AddUniquePart(
            this.data.limit.mod,
            'SR5.Force',
            this.data.force
        )
    }

    /**
     * For rituals reagents must match the force of the ritual at a minimum.
     */
    prepareReagents() {
        this.data.reagents = RitualRules.deriveReagents(this.data.force, this.data.reagents);
    }

    /**
     *
     * @param data Test data to be extended
     */
    _prepareRitualData(data: RitualSpellcastingTestData) {

        // Lower from more to less explicit values being given.
        // Don't let force go below one.
        data.force = Math.max(data.force || 1, 1);
        data.reagents = data.reagents || data.force;
    }

    /**
     * Derive the actual drain damage from spellcasting values.
     * 
     * NOTE: This will be called by the opposing test via a follow up test action.
     */
    calcDrain(opposingHits: number) {
        if (!this.actor) return DataDefaults.createData();

        this.data.drain = RitualRules.drainValue(opposingHits, this.data.reagents, this.data.force);
        this.data.drainDamage = RitualRules.calcDrainDamage(opposingHits, this.data.drain, this.actor.getAttribute('magic').value);
        this.data.drainReady = true;
    }

    /**
     * Allow the currently used force value of this ritual to be reused next time it is cast.
     */
    override async saveUserSelectionAfterDialog() {
        if (!this.item) return;

        await this.item.setLastSpellForce({value: this.data.force});
    }
}