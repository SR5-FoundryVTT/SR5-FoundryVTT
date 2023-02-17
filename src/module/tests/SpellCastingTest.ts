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
export class SpellCastingTest extends SuccessTest {
    data: SpellCastingTestData

    _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.force = data.force || 0;
        data.drain = data.drain || 0;
        data.reckless = data.reckless || false;
        data.drainDamage = data.drainDamage || DataDefaults.damageData();

        return data;
    }

    get _dialogTemplate()  {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/spellcasting-test-dialog.html';
    }

    get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/spellcasting-test-message.html';
    }

    /**
     * This test type can't be extended.
     */
    get canBeExtended() {
        return false;
    }

    static _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            skill: 'spellcasting',
            attribute: 'magic'
        };
    }

    get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds', 'background_count'];
    }

    async prepareDocumentData() {
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

    prepareBaseValues() {
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

    // /**
    //  * Overwrite range from environmental modifiers for indirect combat spells.
    //  * 
    //  * @param actor 
    //  * @param type 
    //  */
    // async prepareActorModifier(actor: SR5Actor, type: ModifierTypes): Promise<{ name: string; value: number; }> {
    //     if (type !== 'environmental' && !this.item?.isIndirectCombatSpell()) return await super.prepareActorModifier(actor, type);

    //     const modifiers = actor.getSituationModifiers();
    // }

    calculateBaseValues() {
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
        if (!this.actor) return DataDefaults.damageData();

        const force = Number(this.data.force);
        const drain = Number(this.data.drain);
        const magic = this.actor.getAttribute('magic').value;

        this.data.drainDamage = DrainRules.calcDrainDamage(drain, force, magic, this.hits.value);
    }

    async processResults() {
        this.calcDrainDamage();

        await super.processResults();
    }

    /**
     * Allow the currently used force value of this spell item to be reused next time.
     */
    async saveUserSelectionAfterDialog() {
        if (!this.item) return;

        await this.item.setLastSpellForce({value: this.data.force, reckless: false});
    }
}