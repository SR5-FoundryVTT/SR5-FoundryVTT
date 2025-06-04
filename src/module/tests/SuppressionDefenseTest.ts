import { CombatRules } from "../rules/CombatRules";
import { PhysicalDefenseTest, PhysicalDefenseTestData } from "./PhysicalDefenseTest";
import { MinimalActionType } from "../types/item/ActionModel";
import { DeepPartial } from "fvtt-types/utils";


export class SuppressionDefenseTest extends PhysicalDefenseTest<PhysicalDefenseTestData> {

    static override _getDefaultTestAction(): DeepPartial<MinimalActionType> {
        return { attribute: 'reaction', attribute2: 'edge' };
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['defense_suppression'];
    }

    override async processFailure() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterSuppressionHit(this.data.incomingDamage);
    }
}