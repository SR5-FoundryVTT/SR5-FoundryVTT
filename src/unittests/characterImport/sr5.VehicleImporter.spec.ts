import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import VehicleParser from '../../module/apps/characterImport/vehicleImport/VehicleParser';
import * as chummerDrone from "./drone.json";
import * as chummerVehicle from "./vehicle.json";
import { SR5TestingDocuments } from '../utils';
import { SR5Actor } from '../../module/actor/SR5Actor';
import { SR5Item } from '../../module/item/SR5Item';

export const vehicleImporterTesting = (context: QuenchBatchContext) => {
  const { describe, it, assert, before, after } = context;

  let vehicleParser = new VehicleParser();

  let testActor;
  let testItem;

  before(async () => {
    testActor = new SR5TestingDocuments(SR5Actor);
    testItem = new SR5TestingDocuments(SR5Item);
  });

  after(async () => {
    await testActor.teardown();
    await testItem.teardown();
  });

  describe("Vehicle Parser", () => {
    it("parses vehicles", async () => {
      const actor = await testActor.create({ type: 'character' });

      const parsedVehicles = await vehicleParser.parseVehicles(actor, { vehicles: { vehicle: [chummerDrone, chummerVehicle] } }, { vehicles: true });

      if(!parsedVehicles) {
        assert.fail("Vehicle Parser failed to create vehicles!");
        return;
      }
      // Register vehicle actors with testing data, so they get cleaned up during teardown
      parsedVehicles.forEach(testActor.register.bind(testActor));
      // Prepare derived data, used to populate system.vehicle_stats.seats.hidden
      parsedVehicles.forEach(vehicle => vehicle.prepareDerivedData())

      const drone = parsedVehicles[0].asVehicle()!;
      const vehicle = parsedVehicles[1].asVehicle()!;

      assert.deepEqual(drone.system.vehicle_stats.seats.value, 0);
      assert.deepEqual(drone.system.vehicle_stats.seats.hidden, true);
      assert.deepEqual(vehicle.system.vehicle_stats.seats.value, 3);
      assert.deepEqual(vehicle.system.vehicle_stats.seats.hidden, false);
    });
  });
}

