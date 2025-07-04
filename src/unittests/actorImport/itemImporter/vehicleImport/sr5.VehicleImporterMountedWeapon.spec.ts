import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import MountedWeaponParser from '../../../../module/apps/importer/actorImport/itemImporter/vehicleImport/MountedWeaponParser';
import * as chummerVehicle from './drone.json';

export const mountedWeaponParserTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert } = context;

    const mountedWeaponParser = new MountedWeaponParser();

    describe('Mounted Weapon Parser', () => {
        it('parses weapons', async () => {
            const weapons = await mountedWeaponParser.parseWeapons(chummerVehicle);

            assert.lengthOf(weapons, 1);
        });
    });
};
