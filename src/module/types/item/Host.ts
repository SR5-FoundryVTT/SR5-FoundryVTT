/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export interface HostData extends
        DevicePartData,
        ImportFlags,
        DescriptionPartData {
            attributes: AttributesData
            rating: number,
            marks: MatrixMarks,
            ic: SourceEntityField[]

            // Disable host attribute calculation
            customAttributes: boolean
    }
}