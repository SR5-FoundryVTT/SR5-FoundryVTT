/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export interface HostData extends
        DevicePartData,
        ImportFlags,
        DescriptionPartData {
            rating: number,
            marks: MatrixMarks,
            ic: SourceEntityField[]
    }
}