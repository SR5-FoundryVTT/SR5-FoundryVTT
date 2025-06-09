/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export interface HostData extends
        DevicePartData,
        ImportFlags,
        DescriptionPartData {
            rating: number,
            marks: any, // MatrixMarks
            ic: SourceEntityField[]

            // Disable host attribute calculation
            customAttributes: boolean
    }
}