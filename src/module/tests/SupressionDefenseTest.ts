import {DefaultValues} from "../data/DataDefaults";
import { CombatRules } from "../rules/CombatRules";
import { PhysicalDefenseTest, PhysicalDefenseTestData } from "./PhysicalDefenseTest";


export class SupressionDefenseTest extends PhysicalDefenseTest {
    public data: PhysicalDefenseTestData;

    static _getDefaultTestAction() {
        return DefaultValues.minimalActionData({
            'attribute': 'reaction',
            'attribute2': 'edge'
        });
    }

    async processFailure() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterSupressionHit(this.data.incomingDamage);
    }
}