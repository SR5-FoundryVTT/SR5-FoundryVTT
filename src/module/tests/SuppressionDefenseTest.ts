import { CombatRules } from "../rules/CombatRules";
import { PhysicalDefenseTest, PhysicalDefenseTestData } from "./PhysicalDefenseTest";
import MinimalActionData = Shadowrun.MinimalActionData;


export class SuppressionDefenseTest extends PhysicalDefenseTest {
    public override data: PhysicalDefenseTestData;

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            'attribute': 'reaction',
            'attribute2': 'edge'
        };
    }

    override async processFailure() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterSupressionHit(this.data.incomingDamage);
    }
}