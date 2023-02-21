/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SpiritType = keyof typeof SR5CONFIG.spiritTypes

    export interface SpiritData extends
        CommonData,
        MagicActorData,
        TwoTrackActorData,
        ArmorActorData,
        WoundsActorData,
        MovementActorData {
            values: PhysicalCombatValues
            spiritType: SpiritType
            force: number
            limits: AwakendLimits
    }
}
