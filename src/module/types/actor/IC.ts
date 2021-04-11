/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type ICType = keyof typeof CONFIG.SR5.ic.types

    export type SR5ICType = SR5ActorBase & {
        data: ICActorData,
        type: 'ic'
    }

    export type ICActorData = CommonActorData &
        MatrixActorData &
        MatrixTrackActorData & {
        icType: ICType,
        host: {
            rating: number
        }
    }
}