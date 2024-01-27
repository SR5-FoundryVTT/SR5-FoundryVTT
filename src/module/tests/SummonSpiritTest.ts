import { SR5 } from './../config';
import { DataDefaults } from "../data/DataDefaults";
import { SuccessTest, SuccessTestData } from "./SuccessTest";
import { PartsList } from '../parts/PartsList';
import { SpellcastingRules } from '../rules/SpellcastingRules';
import { ConjuringRules } from '../rules/ConjuringRules';


interface SummonSpiritTestData extends SuccessTestData {
    spiritTypes: typeof SR5.spiritTypes
    spiritTypeSelected: string

    // Force value as described on SR5#300
    force: number
    // Drain value as described on SR5#300
    drain: number
    drainDamage: Shadowrun.DamageData

    // Reagent value as described on SR5#317 'Summoning'
    reagent: number

    // Determine that summoning concluded and drain is ready to be cast.
    drainReady: boolean

    preparedSpiritUuid: string
}

/**
 * Summoning a spirit is described in SR5#300.
 * 
 * NOTE: While we need spell casting data, we don't need general spell casting flow.
 *       This is due to spell casting operating on spell items, while summoning is a call_in_action item.
 * 
 * Summoning uses the default Success Test, Opposed Test and Followup Flow.
 */
export class SummonSpiritTest extends SuccessTest<SummonSpiritTestData> {

    override _prepareData(data: any, options: any) {
        data = super._prepareData(data, options);

        this._prepareSummoningData(data);

        data.drain = data.drain || 0;
        data.drainDamage = data.drainDamage || DataDefaults.damageData();

        return data;
    }

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/summonspirit-test-dialog.html';
    }

    /**
     * A summoning test can't be extended.
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
     * Skill + Attribute [Limit] as defined in SR5#300 'Attempt summoning'
     * 
     * Limit 'force' is a dynamic test value, so it's missing here as it can't be taken from actor values.
     */
    static override _getDefaultTestAction(): Partial<Shadowrun.MinimalActionData> {
        return {
            skill: 'summoning',
            attribute: 'magic'
        }
    }

    /**
     * Summoning actions are magic actions and get their modifiers.
     */
    override get testModifiers(): Shadowrun.ModifierTypes[] {
        const modifiers = super.testModifiers;
        modifiers.push('background_count');
        return modifiers;
    }

    /**
     * Summoning uses Force as limit, which needs to be injected into the normal test flow.
     */
    override prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareLimitValue();
    }

    /**
     * Validate user input during dialog or creation and inform user about invalid values.
     */
    override validateBaseValues() {
        this.warnAboutInvalidForce();
    }

    /**
     * Notify summoners about incomplete summoning. To avoid pre mature drain tests.
     */
    override async executeFollowUpTest() {
        if (!this.data.drainReady) ui.notifications?.warn('SR5.Warnings.SummoningNotConcluded', {localize: true});
        await super.executeFollowUpTest();
    }

    /**
     * Don't abort execution as there might be some reason users would want to allow 'invalid' values.
     */
    warnAboutInvalidForce() {
        const force = Number(this.data.force);
        const magic = Number(this.actor?.getAttribute('magic')?.value ?? 0);
        if (!ConjuringRules.validForce(force, magic)) {
            ui.notifications?.warn('SR5.Warnings.InvalidSummoningForce', {localize: true});
        }
    }

    /**
     * Calculate limit based on force selected by user.
     * 
     * According to SR5#300 'Summoning' and SR5#316 'Reagents'.
     */
    prepareLimitValue() {
        const force = Number(this.data.force);
        const reagent = Number(this.data.reagent);
        const label = SpellcastingRules.limitIsReagentInsteadOfForce(reagent) ? 
            'SR5.Reagent' : 'SR5.Force';
        const limit = SpellcastingRules.calculateLimit(force, reagent);

        // Cleanup previous calculation and add new limit part.
        // NOTE: Instead of removing all parts, be specific in case of future additions to limit parts elsewhere.
        const limitParts = new PartsList(this.data.limit.mod);

        limitParts.removePart('SR5.Force');
        limitParts.removePart('SR5.Reagent');

        limitParts.addUniquePart(label, limit);
    }

    /**
     * TODO: Reduce all spirit types to those available to the Summoner according to tradition or validate against selection.
     * @returns A subset of all spirit types
     */
    _prepareSpiritTypes() {
        return SR5.spiritTypes;
    }

    /**
     * Take data from summoning item for test execution.
     * @param data Test data to be extended
     */
    _prepareSummoningData(data: SummonSpiritTestData) {
        if (!this.item) return;
        const summoning = this.item.asCallInAction;
        if (!summoning || !this.item.isSummoning) return;

        data.spiritTypes = this._prepareSpiritTypes();

        // Lower from more to less explicit values being given.
        // Don't let force go below one.
        data.force = Math.max(data.force || summoning.system.spirit.force || 1, 1);
        data.spiritTypeSelected = data.spiritTypeSelected || summoning.system.spirit.type;
        data.preparedSpiritUuid = data.preparedSpiritUuid || summoning.system.spirit.uuid;
        data.reagent = data.reagent || 0;
    }

    /**
     * Derive the actual drain damage from spellcasting values.
     * 
     * NOTE: This will be called by the opposing test via a follow up test action.
     */
    calcDrain(opposingHits: number) {
        this.data.drainReady = true;
        this.data.drain = ConjuringRules.summoningDrainValue(opposingHits);
        this.data.drainDamage = this.calcDrainDamage(opposingHits);
    }

    calcDrainDamage(opposingHits: number): Shadowrun.DamageData {
        if (!this.actor) return DataDefaults.damageData();

        const magic = this.actor.getAttribute('magic').value;
        const force = this.data.force;
        
        return ConjuringRules.calcDrainDamage(opposingHits, force, magic);
    }
}
