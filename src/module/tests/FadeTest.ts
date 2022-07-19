import {SuccessTest, SuccessTestData} from "./SuccessTest";
import {ComplexFormTest, ComplexFormTestData} from "./ComplexFormTest";
import DamageData = Shadowrun.DamageData;
import {DefaultValues} from "../data/DataDefaults";

export interface FadeTestData extends SuccessTestData {
    incomingDrain: DamageData
    modifiedDrain: DamageData

    against: ComplexFormTestData
}

/**
 * Handle Technomancer FadeTests
 */
export class FadeTest extends SuccessTest {
    data: FadeTestData
    against: ComplexFormTest

    _prepareData(data, options): any {
        data = super._prepareData(data, options);

        data.against = data.against || new ComplexFormTest({}, {}, options).data;

        data.incomingDrain = DefaultValues.damageData();
        data.modifiedDrain = DefaultValues.damageData();

        return data;
    }
}