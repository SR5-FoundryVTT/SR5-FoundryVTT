/// <reference path="../Shadowrun.ts" />
/**
 * Typing specifically for Item.setFlag / getFlag
 *
 */
declare namespace Shadowrun {
    
    export interface FireModeData {
        value: number
        label: string
        defense: number | string
        recoil: boolean
        mode: RangedWeaponMode
        action: ActionType
    }

    export type SpellForceData = {
        value: number;
        reckless?: boolean;
    };

    export type ComplexFormLevelData = {
        value: number;
    };

    export type FireRangeData = {
        value: number;
    };

    export type ReachData = {
        attacker: {
            value: number;
        };
        defender?: {
            value: number;
        };
    };
}
