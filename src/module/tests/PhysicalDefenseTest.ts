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

    static getMessageActionTestData(againstData, actor, previousMessageId): PhysicalDefenseTestData|undefined {
        const data = super.getMessageActionTestData(againstData, actor, previousMessageId);



        return data as PhysicalDefenseTestData
    }
}