/// <reference path="../Shadowrun.d.ts" />

declare namespace Shadowrun {
    /**
     * Data intended for the provider / master / controller of a matrix network.
     */
    export type MatrixMasterData = MatrixDeviceData & {
        // TODO: taMiF/marks Should this be the global data point for all matrix network visibilities?
        visible: boolean
    }

    /**
     * Data intended for anything connected to a matrix network, both as master and slave.
     */
    export type MatrixDeviceData = {
        // Helper data point to indicate a network connection update.
        // This is not storing data that's used anywhere but rather is used
        // to trigger sheet renders across all userse sessions when this actors
        // network connection is updated. The connection itself is stored in DataStorage.
        updatedConnections: number // Will store a timestamp of when the connection changed last.
    }
}
