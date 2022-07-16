import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {SpellcastingRules} from "../rules/SpellcastingRules";
import {PartsList} from "../parts/PartsList";
import {CombatSpellRules} from "../rules/CombatSpellRules";
import {DefaultValues} from "../data/DataDefaults";


export interface SpellCastingTestData extends SuccessTestData {
    force: number
    drain: number
    reckless: boolean
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

        return data;
    }

    get _dialogTemplate()  {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/spellcasting-test-dialog.html';
    }

    static _getDefaultTestAction() {
        return DefaultValues.minimalActionData({
            skill: 'spellcasting',
            attribute: 'magic'
        });
    }

    get testModifiers() {
        return ['global', 'wounds'];
    }

    async prepareDocumentData() {
        this.prepareInitialForceValue();
    }

    /**
     * Set a force value based on the items history or viable suggestions.
     */
    prepareInitialForceValue() {
        if (!this.item) return;

        const lastUsedForce = this.item.getLastSpellForce();
        const suggestedForce = SpellcastingRules.calculateMinimalForce(this.item.getDrain());
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

    calculateBaseValues() {
        super.calculateBaseValues();
        this.calculateDrainValue()
    }

    /**
     * Precalculate drain for user display.
     */
    calculateDrainValue() {
        const force = Number(this.data.force);
        const drain = Number(this.item?.getDrain() || 0);
        const reckless = this.data.reckless;
        this.data.drain = SpellcastingRules.calculateDrain(force, drain, reckless);
    }

    async afterTestComplete(): Promise<void> {
        await this.saveLastUsedForce();
        await super.afterTestComplete();
    }

    /**
     * Allow the currently used force value of this spell item to be reused next time.
     */
    async saveLastUsedForce() {
        if (!this.item) return;

        await this.item.setLastSpellForce({value: this.data.force, reckless: false});
    }
}