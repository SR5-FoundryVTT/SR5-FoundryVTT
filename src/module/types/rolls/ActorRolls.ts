import { DamageType } from "../item/Action"
import { BaseValuePairType } from "../template/Base";

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
