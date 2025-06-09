import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import VehicleParser from '../../../../module/apps/importer/actorImport/itemImporter/vehicleImport/VehicleParser';
import * as chummerDrone from './drone.json';
import * as chummerVehicle from './vehicle.json';
import { SR5Actor } from '../../../../module/actor/SR5Actor';

export const vehicleImporterTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

    const vehicleParser = new VehicleParser();

    before(async () => {});
    after(async () => {});

    describe('Vehicle Parser', () => {
        it('parses vehicles', async () => {
            const actor = new SR5Actor<'vehicle'>({ type: 'character' });

            const parsedVehicles = await vehicleParser.parseVehicles(
                actor,
                { vehicles: { vehicle: [chummerDrone, chummerVehicle] } },
                { vehicles: true },
            ) as SR5Actor<'vehicle'>[];

            if (!parsedVehicles) {
                assert.fail('Vehicle Parser failed to create vehicles!');
                return;
            }
            // Register vehicle actors with testing data, so they get cleaned up during teardown
            // parsedVehicles.forEach(testActor.register.bind(testActor));
            // Prepare derived data, used to populate system.vehicle_stats.seats.hidden
            parsedVehicles.forEach((vehicle) => vehicle.prepareDerivedData());

            const drone = parsedVehicles[0];
            const vehicle = parsedVehicles[1];

            assert.deepEqual(drone.system.vehicle_stats.seats.value, 0);
            assert.deepEqual(drone.system.vehicle_stats.seats.hidden, true);
            assert.deepEqual(vehicle.system.vehicle_stats.seats.value, 3);
            assert.deepEqual(vehicle.system.vehicle_stats.seats.hidden, false);

            await actor.delete();
            await drone.delete();
            await vehicle.delete();
        });
    });
};
