import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import VehicleModsParser from '../../../../module/apps/importer/actorImport/itemImporter/vehicleImport/VehicleModsParser';
import * as chummerDrone from './drone.json';

export const vehicleModParserTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

    let parser = new VehicleModsParser();

    describe('Vehicle Mod Parser', () => {

        it('parses mods', async () => {
            let mods = await parser.parseMods(chummerDrone, false);

            assert.lengthOf(mods, 2);
            
            let ecm = mods.find(mod => mod.name === "ECM")
            assert.isNotNull(ecm)
            assert.strictEqual(ecm.name, "ECM")
            assert.strictEqual(ecm.type, "modification")
            assert.strictEqual(ecm.system.technology.availability.base, "9V")
            assert.strictEqual(ecm.system.technology.availability.value, "9V")
            assert.strictEqual(ecm.system.description.source, "R5 173")
        });
    });
};
