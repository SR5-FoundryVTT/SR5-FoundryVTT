/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type ICType = keyof typeof SR5CONFIG.ic.types

    export interface ICData extends
        CommonActorData,
        MatrixActorData,
        MatrixTrackActorData {
            icType: ICType,
            host: {
                rating: number
            }
    }
}