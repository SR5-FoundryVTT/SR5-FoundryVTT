/// <reference path="../Shadowrun.d.ts" />

declare namespace Shadowrun {
    export type CritterType = keyof typeof SR5CONFIG.critterTypes;

    export interface CritterData extends
        CommonData, MagicActorData,
        TwoTrackActorData,
        ArmorActorData,
        WoundsActorData,
        MatrixNetworkActorData,
        MovementActorData,
        NPCActorData {
            values: PhysicalCombatValues
            limits: CharacterLimits
    }
}
