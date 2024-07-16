/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export interface HostData extends
        DevicePartData,
        ImportFlags,
        DescriptionPartData {
            attributes: AttributesData
            rating: number,
            marks: MatrixMarks,
            // uuid of started ic on this actor.
            ic: string[]

            // Disable host attribute calculation
            customAttributes: boolean
    }
}