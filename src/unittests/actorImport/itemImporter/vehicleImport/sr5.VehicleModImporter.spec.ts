import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import VehicleModsParser from '../../../../module/apps/importer/actorImport/itemImporter/vehicleImport/VehicleModsParser';
import * as chummerDrone from './drone.json';

export const vehicleModParserTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

    const parser = new VehicleModsParser();

    describe('Vehicle Mod Parser', () => {

        it('parses mods', async () => {
            const mods = await parser.parseMods(chummerDrone as any, false);

            assert.lengthOf(mods, 2);
            
            const ecm = mods.find(mod => mod.name === "ECM")!;
            assert.isNotNull(ecm)
            assert.strictEqual(ecm.name, "ECM")
            assert.strictEqual(ecm.type, "modification")
            assert.strictEqual(ecm.system.technology.availability, "9V")
            assert.strictEqual(ecm.system.description.source, "R5 173")
        });
    });
};
