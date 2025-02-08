/// <reference path="../Shadowrun.d.ts" />
declare namespace Shadowrun {
    export interface SpritePowerData extends
        SpritePowerPartData,
        ActionPartData,
        ImportFlags,
        DescriptionPartData {
    }

    export interface SpritePowerPartData {
        duration: keyof typeof SR5CONFIG.spritePower.durations;
        optional: keyof typeof SR5CONFIG.spritePower.optional;
        enabled: boolean
    }
}
