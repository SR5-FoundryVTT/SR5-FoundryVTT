/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    /**
     * Types for data stored in the global storage. See DataStorage.
     */
    type Storage = {
        // Marks placed by and on NetworkDevices.
        matrix: MatrixStorage
    }

    type MatrixStorage = {
        // stores relationships between marks placed and documents placing them
        // this is used for clean up during document deletion and matrix device reboot
        marks: Record<string, string[]>
        // stores tracked actors and their scores.
        ow: Record<string, { score: number }>
        // stores relationships between networks and their icons
        networks: Record<string, string[]>
    }
}
