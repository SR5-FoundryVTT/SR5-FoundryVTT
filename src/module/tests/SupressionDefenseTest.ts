import {DefaultValues} from "../data/DataDefaults";
import { PhysicalDefenseTest, PhysicalDefenseTestData } from "./PhysicalDefenseTest";


export class SupressionDefenseTest extends PhysicalDefenseTest {
    public data: PhysicalDefenseTestData;

    static _getDefaultTestAction() {
        return DefaultValues.minimalActionData({
            'attribute': 'reaction',
            'attribute2': 'edge'
        });
    }
}