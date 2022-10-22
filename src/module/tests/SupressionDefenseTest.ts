import { CombatRules } from "../rules/CombatRules";
import { PhysicalDefenseTest, PhysicalDefenseTestData } from "./PhysicalDefenseTest";
import MinimalActionData = Shadowrun.MinimalActionData;


export class SupressionDefenseTest extends PhysicalDefenseTest {
    public data: PhysicalDefenseTestData;

    static _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            'attribute': 'reaction',
            'attribute2': 'edge'
        };
    }

    async processFailure() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterSupressionHit(this.data.incomingDamage);
    }
}