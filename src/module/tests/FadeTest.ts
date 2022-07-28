import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {ComplexFormTest, ComplexFormTestData} from "./ComplexFormTest";
import DamageData = Shadowrun.DamageData;
import {Helpers} from "../helpers";
import {DrainRules} from "../rules/DrainRules";
import {FadeRules} from "../rules/FadeRules";
import MinimalActionData = Shadowrun.MinimalActionData;

export interface FadeTestData extends SuccessTestData {
    incomingFade: DamageData
    modifiedFade: DamageData

    against: ComplexFormTestData
}

export class FadeTest extends SuccessTest {
    data: FadeTestData
    against: ComplexFormTest

    _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.against = data.against || new ComplexFormTest({}, {}, options).data;

        data.incomingFade = foundry.utils.duplicate(data.against.fadeDamage);
        data.modifiedFade = foundry.utils.duplicate(data.incomingFade);

        return data;
    }

    get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/fade-test-dialog.html';
    }

    get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/fade-test-message.html';
    }

    static _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            'attribute': 'resonance',
            'attribute2': 'willpower'
        };
    }

    get testModifiers() {
        return ['global', 'fade']
    }

     get canBeExtended() {
        return false;
    }

    /**
     * A drain test is successful whenever it has more hits than drain damage
     */
    get success(): boolean {
        return this.data.modifiedFade.value <= 0;
    }

    get successLabel(): string {
        return 'SR5.ResistedAllDamage';
    }

    get failureLabel(): string {
        return 'SR5.ResistedSomeDamage'
    }

    /**
     * Re-calculate incomingFade in case of user input
     */
    calculateBaseValues() {
        super.calculateBaseValues();

        // Avoid using a user defined value override.
        this.data.modifiedFade.base = Helpers.calcTotal(this.data.incomingFade, {min: 0});
    }

    async processResults() {
        // Don't use incomingDrain as it might have a user value override applied.
        this.data.modifiedFade = FadeRules.modifyFadeDamage(this.data.modifiedFade, this.hits.value);

        await super.processResults();
    }
}