import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {SpellcastingRules} from "../rules/SpellcastingRules";
import {PartsList} from "../parts/PartsList";
import {DataDefaults} from "../data/DataDefaults";
import {DrainRules} from "../rules/DrainRules";
import DamageData = Shadowrun.DamageData;
import MinimalActionData = Shadowrun.MinimalActionData;
import ModifierTypes = Shadowrun.ModifierTypes;


export interface SpellCastingTestData extends SuccessTestData {
    force: number
    drain: number
    reckless: boolean

    drainDamage: DamageData
}


/**
 * Spellcasting tests as described on SR5#281 in the spellcasting chapter.
 *
 */
export class SpellCastingTest extends SuccessTest<SpellCastingTestData> {

    override _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.force = data.force || 0;
        data.drain = data.drain || 0;
        data.reckless = data.reckless || false;
        data.drainDamage = data.drainDamage || DataDefaults.createData('damage');

        return data;
    }

    override get _dialogTemplate()  {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/spellcasting-test-dialog.html';
    }

    override get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/spellcasting-test-message.html';
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            skill: 'spellcasting',
            attribute: 'magic'
        };
    }

    /**
     * Spellcasting test category directly depends on the spell cast.
     */
    override get testCategories(): Shadowrun.ActionCategories[] {
        const spell = this.item?.asType('spell');
        if (!spell) return [];

        switch (spell.system.category) {
            case 'combat': return ['spell_combat'];
            case 'detection': return ['spell_detection'];
            case 'health': return ['spell_healing'];
            case 'illusion': return ['spell_illusion'];
            case 'manipulation': return ['spell_manipulation'];
            case 'ritual': return ['spell_ritual'];
        }

        return []

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
        const suggestedForce = SpellcastingRules.calculateMinimalForce(this.item.getDrain);
        this.data.force = lastUsedForce.value || suggestedForce;
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareLimitValue();
    }

    prepareLimitValue() {
        const force = Number(this.data.force);
        this.data.limit.mod = PartsList.AddUniquePart(
            this.data.limit.mod,
            'SR5.Force',
            SpellcastingRules.calculateLimit(force));
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
        const drain = Number(this.item?.getDrain);
        const reckless = this.data.reckless;
        this.data.drain = SpellcastingRules.calculateDrain(force, drain, reckless);
    }

    /**
     * Derive the actual drain damage from spellcasting values.
     */
    calcDrainDamage() {
        if (!this.actor) return DataDefaults.createData();

        const force = Number(this.data.force);
        const drain = Number(this.data.drain);
        const magic = this.actor.getAttribute('magic').value;

        this.data.drainDamage = DrainRules.calcDrainDamage(drain, force, magic, this.hits.value);
    }

    override async processResults() {
        this.calcDrainDamage();

        await super.processResults();
    }

    /**
     * Allow the currently used force value of this spell item to be reused next time.
     */
    override async saveUserSelectionAfterDialog() {
        if (!this.item) return;

        await this.item.setLastSpellForce({value: this.data.force, reckless: false});
    }
}