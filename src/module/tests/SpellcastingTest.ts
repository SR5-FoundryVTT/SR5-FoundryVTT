import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {SpellcastingRules} from "../rules/SpellcastingRules";


export interface SpellcastingTestData extends SuccessTestData {
    force: number
    drain: number
}


/**
 * Spellcasting tests as described on SR5#281 in the spellcasting chapter.
 */
export class SpellcastingTest extends SuccessTest {
    data: SpellcastingTestData

    _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.force = 0;
        data.drain = 0;

        return data;
    }

    get _dialogTemplate()  {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/spellcasting-test-dialog.html';
    }

    async prepareDocumentData() {
        this.prepareInitialForceValue();
    }

    /**
     * Set a force value based on the items history or viable suggestions.
     */
    prepareInitialForceValue() {
        if (!this.item) return;

        // Either use the last used spell force OR suggest a minimal viable force.
        const lastUsedForce = this.item.getLastSpellForce();
        const suggestedForce = SpellcastingRules.calculateMinimalForce(this.item.getDrain());
        this.data.force = lastUsedForce.value || suggestedForce;
    }

    calculateBaseValues() {
        super.calculateBaseValues();
        this.calculateDrainValue()
    }

    /**
     * Precalculate drain for user display.
     */
    calculateDrainValue() {
        this.data.drain = SpellcastingRules.calculateDrain(Number(this.data.force), Number(this.item?.getDrain() || 0));
    }

    async processResults(): Promise<void> {
        await super.processResults();
        await this.saveLastUsedForce();
    }

    /**
     * Allow the currently used force value of this spell item to be reused next time.
     */
    async saveLastUsedForce() {
        if (!this.item) return;

        console.error('implement reckless spellcasting');
        await this.item.setLastSpellForce({value: this.data.force, reckless: false});
    }
}