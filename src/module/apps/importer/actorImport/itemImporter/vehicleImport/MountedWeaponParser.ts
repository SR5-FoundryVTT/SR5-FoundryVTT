import { getArray } from "../importHelper/BaseParserFunctions";
import { WeaponParser } from "../weaponImport/WeaponParser";
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

type VehicleType = Unwrap<NonNullable<ActorSchema['vehicles']>['vehicle']>;

export default class MountedWeaponParser {

    async parseWeapons(vehicle: VehicleType, assignIcons: boolean = false) {
        const mods = getArray(vehicle.mods?.mod);
        const weapons = mods.filter(mod => mod.weapons != null).map(mod => getArray(mod.weapons?.weapon)).flat()

        return new WeaponParser().parseWeaponArray(weapons, assignIcons)
    }
}
