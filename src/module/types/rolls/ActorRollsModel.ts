import { DamageType } from "../item/ActionModel"

export type ModifiedDamageType = {
    incoming: DamageType;
    modified: DamageType;
}