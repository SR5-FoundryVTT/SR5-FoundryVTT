/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    /**
     * General actor limits, available for all actors.
     * 
     * The general fallback is to still allow any limit name to be applied during actor prep.
     */
    export interface Limits {
        [name: string]: LimitField;

        social: LimitField
        mental: LimitField
        physical: LimitField
    }

    export interface AwakendLimits extends Limits {
        astral: LimitField
        magic: LimitField
    }

    export interface MatrixLimits extends Limits {
        attack: LimitField
        stealth: LimitField
        firewall: LimitField
        // TODO: What's the key for dp?
        data_processing: LimitField
    }

    export type LimitField = BaseValuePair<number> & ModifiableValue & CanHideFiled & LabelField;
}
