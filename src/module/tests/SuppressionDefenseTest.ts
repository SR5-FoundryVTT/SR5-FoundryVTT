import { CombatRules } from "../rules/CombatRules";
import { PhysicalDefenseTest, PhysicalDefenseTestData } from "./PhysicalDefenseTest";
import MinimalActionData = Shadowrun.MinimalActionData;


export class SuppressionDefenseTest extends PhysicalDefenseTest<PhysicalDefenseTestData> {

    static override _getDefaultTestAction(): Partial<MinimalActionData> {
        return {
            'attribute': 'reaction',
            'attribute2': 'edge'
        };
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['defense_suppression'];
    }

    override async processFailure() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterSuppressionHit(this.data.incomingDamage);
    }
}