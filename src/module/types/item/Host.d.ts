/// <reference path="../Shadowrun.d.ts" />

declare namespace Shadowrun {
    export interface HostData extends
        DevicePartData,
        ImportFlags,
        DescriptionPartData,
        MatrixNetworkData {
            attributes: AttributesData
            rating: number,
            marks: MatrixMarks,
            // uuid of started ic on this actor.
            ic: string[]

            // Disable host attribute calculation
            customAttributes: boolean
    }
}