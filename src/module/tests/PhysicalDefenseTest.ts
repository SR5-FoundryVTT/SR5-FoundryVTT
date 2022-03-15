import { DefaultValues } from "../data/DataDefaults";
import {OpposedTest, OpposedTestData, OpposedTestValues} from "./OpposedTest";
import {SuccessTestData, SuccessTestValues} from "./SuccessTest";


interface PhysicalDefenseTestValues extends OpposedTestValues {
    damage: Shadowrun.DamageData
}

export interface PhysicalDefenseTestData extends OpposedTestData {
    values: PhysicalDefenseTestValues
}

export class PhysicalDefenseTest extends OpposedTest {
    public data: PhysicalDefenseTestData;

    _prepareData(data, options?): any {
        data = super._prepareData(data, options);

        data.values.damage = DefaultValues.damageData();

        return data;
    }
}