/// <reference path="../Shadowrun.ts" />
/**
 * Typing specifically for Item.setFlag / getFlag
 *
 */
declare namespace Shadowrun {
    
    export interface FireModeData {
        // Amound of rounds fired
        value: number
        // Display label string
        label: string
        // Defense modification value
        defense: number | string
        // Does this firemode cause recoil?
        recoil: boolean
        // Does this firemode cause suppresssion?
        suppression: boolean
        // The ranged weapon mode to be used with
        mode: RangedWeaponMode
        // What action must be spent
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
