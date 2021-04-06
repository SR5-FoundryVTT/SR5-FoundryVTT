/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type CritterType = keyof typeof CONFIG.SR5.critterTypes;

    export type SR5CritterType = SR5ActorBase & {
        data: CritterActorData;
        type: 'critter';
    };

    export type CritterActorData = CommonActorData &
        MagicActorData &
        TwoTrackActorData &
        ArmorActorData &
        WoundsActorData &
        MatrixActorData &
        MovementActorData;
}
