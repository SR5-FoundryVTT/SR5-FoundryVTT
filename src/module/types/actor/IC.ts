/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type ICType = keyof typeof SR5CONFIG.ic.types

    export interface ICData extends
        CommonData,
        MatrixActorData,
        MatrixTrackActorData {
            icType: ICType,
            host: {
                // The hosts rating for this IC. If no host is connected, this can still be used.
                rating: number,
                // The document id of a connected host.
                id: string,
                // The hosts matrix attribute selection.
                atts: MatrixAttributes
            }
    }
}