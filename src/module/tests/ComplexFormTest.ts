import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {DefaultValues} from "../data/DataDefaults";
import {ComplexFormRules} from "../rules/ComplexFormRules";
import {PartsList} from "../parts/PartsList";

export interface ComplexFormTestData extends SuccessTestData {
    level: number
    fade: number
}

/**
 * Handles threading complex forms as described on SR5#251.
 */
export class ComplexFormTest extends SuccessTest {
    data: ComplexFormTestData

    _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.level =  data.level || 0;
        data.fade = data.face || 0;

        return data;
    }

    get _dialogTemplate()  {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/complexform-test-dialog.html';
    }

    static _getDefaultTestAction() {
        return DefaultValues.minimalActionData({
            skill: 'software',
            attribute: 'resonance'
        });
    }

    // TODO: Add missing modifiers (noise, gitter) // SR5#251
    get testModifiers() {
        return ['global', 'wounds'];
    }

    async prepareDocumentData() {
        this.prepareInitialLevelValue();
    }

    /**
     * Set a level value based on the items history or viable suggestions.
     */
    prepareInitialLevelValue() {
        if (!this.item) return;

        const lastUsedLevel = this.item.getLastComplexFormLevel();
        const suggestedLevel = ComplexFormRules.calculateMinimalLevel(this.item.getFade());
        this.data.level = lastUsedLevel.value || suggestedLevel;
    }

    prepareBaseValues() {
        super.prepareBaseValues();
        this.prepareLevelValue();
        this.prepareLimitValue();
    }

    /**
     * Assert user input doesn't create unusable level values.
     */
    prepareLevelValue() {
        this.data.level = ComplexFormRules.calculateLevel(this.data.level);
    }

    /**
     * Derive limit value based on complex form rules.
     */
    prepareLimitValue() {
        const level = Number(this.data.level);
        this.data.limit.mod = PartsList.AddUniquePart(
            this.data.limit.mod,
            'SR5.Level',
            ComplexFormRules.calculateLimit(level)
        )
    }

    calculateBaseValues() {
        super.calculateBaseValues();
        this.calculateFadeValue();
    }

    calculateFadeValue() {
        const level = Number(this.data.level);
        const fade = Number(this.item?.getFade() || 0);
        this.data.fade = ComplexFormRules.calculateFade(level, fade);
    }

    async afterTestComplete() {
        await this.saveLastUsedLevel();

        await super.afterTestComplete();
    }

    /**
     * Allow the currently used level value for this complex form item to be reused next time.
     */
    async saveLastUsedLevel() {
        if (!this.item) return;

        await this.item.setLastComplexFormLevel({value: this.data.level});
    }
}