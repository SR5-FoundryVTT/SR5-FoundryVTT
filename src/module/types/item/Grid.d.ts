/// <reference path="../Shadowrun.d.ts" />

declare namespace Shadowrun {
    export interface GridData extends
        DevicePartData,
        DescriptionPartData,
        GridMatrixData {}

    interface GridMatrixData {
        matrix: MatrixMasterData;
    }
}