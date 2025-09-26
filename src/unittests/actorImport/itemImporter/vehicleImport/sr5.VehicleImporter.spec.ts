import * as chummerDrone from './drone.json';
import * as chummerVehicle from './vehicle.json';
import { SR5TestFactory } from 'src/unittests/utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5Actor } from '../../../../module/actor/SR5Actor';
import { VehicleParser } from '../../../../module/apps/importer/actorImport/itemImporter/vehicleImport/VehicleParser';

export const vehicleImporterTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;
    const vehicleParser = new VehicleParser();

    after(async () => { factory.destroy(); });

    // describe('Vehicle Parser', () => {
    //     it('parses vehicles', async () => {
    //         const character = await factory.createActor({ type: 'character' });

    //         const parsedVehicles = await vehicleParser.parseVehicles(
    //             character,
    //             { vehicles: { vehicle: [chummerDrone, chummerVehicle] } } as any,
    //             { vehicles: true },
    //         ) as SR5Actor<'vehicle'>[];

    //         if (!parsedVehicles) {
    //             assert.fail('Vehicle Parser failed to create vehicles!');
    //             return;
    //         }

    //         factory.actors.push(...parsedVehicles);

    //         // Register vehicle actors with testing data, so they get cleaned up during teardown
    //         // parsedVehicles.forEach(testActor.register.bind(testActor));
    //         // Prepare derived data, used to populate system.vehicle_stats.seats.hidden
    //         parsedVehicles.forEach((vehicle) => { vehicle.prepareDerivedData(); });

    //         const drone = parsedVehicles[0];
    //         const vehicle = parsedVehicles[1];

    //         assert.deepEqual(drone.system.vehicle_stats.seats.value, 0);
    //         assert.deepEqual(drone.system.vehicle_stats.seats.hidden, true);
    //         assert.deepEqual(vehicle.system.vehicle_stats.seats.value, 3);
    //         assert.deepEqual(vehicle.system.vehicle_stats.seats.hidden, false);
    //     });
    // });
};
