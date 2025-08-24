const { NumberField, BooleanField } = foundry.data.fields;

/**
 * Data intended for anything connected to a matrix network, both as master and slave.
 */
export const MatrixDeviceData = () => ({
    // Helper data point to indicate a network connection update.
    // This is not storing data that's used anywhere but rather is used
    // to trigger sheet renders across all user sessions when this actors
    // network connection is updated. The connection itself is stored in DataStorage.
    updatedConnections: new NumberField({ required: true, nullable: false, integer: true, initial: 0 })
});

/**
 * Data intended for the provider / master / controller of a matrix network.
 */
export const MatrixMasterData = () => ({
    ...MatrixDeviceData(),

    visible: new BooleanField()
});
