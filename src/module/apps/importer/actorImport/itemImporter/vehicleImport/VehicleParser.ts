import { WeaponParser } from "../weaponImport/WeaponParser";
import { GearsParser } from "../importHelper/GearsParser";
import MountedWeaponParser from "./MountedWeaponParser";
import { SR5Actor } from '../../../../../actor/SR5Actor';
import VehicleModsParser from "./VehicleModsParser";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
import { ImportHelper as IH } from "@/module/apps/itemImport/helper/ImportHelper";
import { ExtractItemType } from "../Parser";
import { DataDefaults } from "@/module/data/DataDefaults";

export interface BlankVehicle extends Actor.CreateData {
    type: 'vehicle',
    name: string,
    items: Item.CreateData[],
    effects: ActiveEffect.CreateData[],
    system: ReturnType<typeof DataDefaults.baseSystemData<'vehicle'>>,
};

export class VehicleParser {
    private getStartObj(vehicle: ExtractItemType<'vehicles', 'vehicle'>): BlankVehicle {
        return {
            type: 'vehicle',
            items: [],
            effects: [],
            system: DataDefaults.baseSystemData('vehicle'),
            name: vehicle.fullname ?? vehicle.name ?? "Unnamed Vehicle",
        };
    }

    async parseVehicles(actor: Actor.Stored, vehicles: ExtractItemType<'vehicles', 'vehicle'>[]) {
        const vehicleActors: BlankVehicle[] = [];

        for (const vehicle of vehicles) {
            const vehicleActorData = this.getStartObj(vehicle);
            vehicleActorData.folder = actor.folder?.id ?? null;

            const system = vehicleActorData.system;
            system.driver = actor.id!;
            system.isDrone = vehicle.isdrone === "True";

            vehicleActorData.items = [
                ...await new WeaponParser().parseWeapons(vehicle),
                ...await new GearsParser().parseItems(vehicle.gears?.gear),
                ...await new MountedWeaponParser().parseWeapons(vehicle),
                ...await new VehicleModsParser().parseItems(vehicle.mods?.mod)
            ];

            const [handling, off_road_handling] = vehicle.handling?.split('/') ?? [vehicle.handling, vehicle.handling];
            const [speed, off_road_speed] = vehicle.speed?.split('/') ?? [vehicle.speed, vehicle.speed];

            system.vehicle_stats.pilot.base = Number(vehicle.pilot) || 0;
            system.vehicle_stats.handling.base = Number(handling) || 0;
            system.vehicle_stats.off_road_handling.base = Number(off_road_handling) || 0;
            system.vehicle_stats.speed.base = Number(speed) || 0;
            system.vehicle_stats.off_road_speed.base = Number(off_road_speed) || 0;
            system.vehicle_stats.acceleration.base = Number(vehicle.accel) || 0;
            system.vehicle_stats.sensor.base = Number(vehicle.sensor) || 0;
            system.vehicle_stats.seats.base = Number(vehicle.seats) || 0;

            system.attributes.body.base = Number(vehicle.body) || 0;
            system.armor.base = Number(vehicle.armor) || 0;

            const consoleLogs = Sanitizer.sanitize(CONFIG.Actor.dataModels.vehicle.schema, system);
            if (consoleLogs) {
                console.warn(`Vehicle Sanitized on Import: Name: ${vehicle.name}\n`);
                console.table(consoleLogs);
            }

            vehicleActors.push(vehicleActorData);
        }

        return vehicleActors;
    }
}
