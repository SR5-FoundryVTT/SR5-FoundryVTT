/// <reference path="../Shadowrun.d.ts" />

declare namespace Shadowrun {
    /**
     * Types around global storage of the system. See DataStorage.
     */
    type Storage = {
        // Marks placed by and on NetworkDevices.
        matrix: MatrixStorage
    }

    type MatrixStorage = {
        // stores relationships between marks placed and documents placing them
        // this is used for clean up during document deletion and matrix device reboot
        marks: Record<string, string[]>
    }
}