/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type FireModeData = {
        value: number;
        label: string;
        defense?: number | string;
    };

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
