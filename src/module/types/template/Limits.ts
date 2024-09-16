/// <reference path="../Shadowrun.d.ts" />
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
        initiation: LimitField
    }

    export interface MatrixLimits extends Limits {
        attack: LimitField
        stealth: LimitField
        firewall: LimitField
        // TODO: What's the key for dp?
        data_processing: LimitField
    }

    /**
     * Describes a limit used in actor data.
     * Differes from LimitValue which is used in item action data and contains less fields.
     */
    export type LimitField = BaseValuePair<number> & ModifiableValue & CanHideFiled & LabelField;
}
