/// <reference path="../Shadowrun.ts" />

// TODO: Check CommonActorData in last commit. Propably moves attributes. limits and so forth into one type.
declare namespace Shadowrun {
    export type CritterType = keyof typeof SR5CONFIG.critterTypes;

    export interface CritterData extends
        CommonData, MagicActorData,
        TwoTrackActorData,
        ArmorActorData,
        WoundsActorData,
        MatrixActorData,
        MovementActorData {
    }
}
