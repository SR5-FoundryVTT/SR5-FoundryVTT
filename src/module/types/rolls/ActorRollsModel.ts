import { DamageType } from "../item/ActionModel"
import { BaseValuePairType } from "../template/BaseModel";

export type ModifiedDamageType = {
    incoming: DamageType;
    modified: DamageType;
}

export type SkillRollOptions = Shadowrun.ActorRollOptions & {
    // A specialization should be used.
    specialization?: boolean
    // Skills should be searched not by id but their label.
    byLabel?: boolean
    threshold?: BaseValuePairType
};
