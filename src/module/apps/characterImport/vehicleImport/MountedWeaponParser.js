import { getArray } from "../importHelper/BaseParserFunctions.js"
import { WeaponParser } from "../weaponImport/WeaponParser.js";
import * as IconAssign from '../../iconAssigner/iconAssign.js';

export class MountedWeaponParser {

    async parseWeapons(vehicle, assignIcons) {
        const mods = getArray(vehicle.mods?.mod);
        const weapons = mods.filter(mod => mod.weapons != null).map(mod => getArray(mod.weapons?.weapon)).flat()

        return  new WeaponParser().parseWeaponArray(weapons, assignIcons)
    }
}