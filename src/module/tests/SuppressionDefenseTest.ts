import { CombatRules } from "../rules/CombatRules";
import { PhysicalDefenseTest, PhysicalDefenseTestData } from "./PhysicalDefenseTest";
import { MinimalActionType } from "../types/item/Action";
import { DeepPartial } from "fvtt-types/utils";


export class SuppressionDefenseTest extends PhysicalDefenseTest<PhysicalDefenseTestData> {

    static override _getDefaultTestAction(): DeepPartial<MinimalActionType> {
        return { attribute: 'reaction' as any, attribute2: 'edge' };
    }

    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['defense_suppression'];
    }

    // oxlint-disable-next-line typescript/require-await -- Overrides the async SuccessTest hook, which must keep returning a Promise.
    override async processFailure() {
        this.data.modifiedDamage = CombatRules.modifyDamageAfterSuppressionHit(this.data.incomingDamage);
    }
}