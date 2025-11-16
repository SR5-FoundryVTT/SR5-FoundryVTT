import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";
import { WeaponParser } from "../weaponImport/WeaponParser";
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

type VehicleType = Unwrap<NonNullable<ActorSchema['vehicles']>['vehicle']>;

export default class MountedWeaponParser {

    async parseWeapons(vehicle: VehicleType) {
        const mods = IH.getArray(vehicle.mods?.mod);
        const weapons = mods.filter(mod => mod.weapons != null).map(mod => IH.getArray(mod.weapons?.weapon)).flat();

        return new WeaponParser().parseItems(weapons);
    }
}
