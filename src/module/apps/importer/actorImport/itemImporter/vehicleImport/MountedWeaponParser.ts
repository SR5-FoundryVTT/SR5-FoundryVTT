import { ActorSchema } from "../../ActorSchema.js";
import { getArray } from "../importHelper/BaseParserFunctions.js"
import { Unwrap } from "../ItemsParser.js";
import { WeaponParser } from "../weaponImport/WeaponParser.js";

type VehicleType = Unwrap<NonNullable<ActorSchema['vehicles']>['vehicle']>;

export default class MountedWeaponParser {

    async parseWeapons(vehicle: VehicleType, assignIcons: boolean = false) {
        const mods = getArray(vehicle.mods?.mod);
        const weapons = mods.filter(mod => mod.weapons != null).map(mod => getArray(mod.weapons?.weapon)).flat()

        return  new WeaponParser().parseWeaponArray(weapons, assignIcons)
    }
}