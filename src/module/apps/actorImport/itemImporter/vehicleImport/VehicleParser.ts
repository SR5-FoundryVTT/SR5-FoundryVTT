import { WeaponParser } from "../weaponImport/WeaponParser";
import { GearsParser } from "../importHelper/GearsParser";
import MountedWeaponParser from "./MountedWeaponParser";
import { SR5Actor } from "../../../../actor/SR5Actor";
import VehicleModsParser from "./VehicleModsParser";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";
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

    async parseVehicles(actor: SR5Actor<'character'>, vehicles: ExtractItemType<'vehicles', 'vehicle'>[]) {
        const vehicleActors: BlankVehicle[] = [];

        for (const vehicle of vehicles) {
            const vehicleActorData = this.getStartObj(vehicle);
            vehicleActorData.folder = actor.folder?.id ?? null;

            const system = vehicleActorData.system;
            system.driver = actor.id!;
            system.isDrone = vehicle.isdrone === "True";
            const categoryName = vehicle.category_english || vehicle.category || '';

            if (system.isDrone)
                system.category = categoryName.replace("Drones: ", "").toLowerCase() as typeof system.category;

            vehicleActorData.items = [
                ...await new WeaponParser().parseWeapons(vehicle),
                ...await new GearsParser().parseItems(vehicle.gears?.gear),
                ...await new MountedWeaponParser().parseWeapons(vehicle),
                ...await new VehicleModsParser().parseItems(vehicle.mods?.mod)
            ];

            function parseSeparatedValues(value: string): { base: number; offRoad: number } {
                const [base, offRoad] = value.split("/").map(v => +v || 0) as [number, number | undefined];
                return { base, offRoad: offRoad ?? base };
            }

            const handlingValues = parseSeparatedValues(vehicle.handling);
            const speedValues = parseSeparatedValues(vehicle.speed);
            const accelerationValues = parseSeparatedValues(vehicle.accel);

            system.vehicle_stats.pilot.base = Number(vehicle.pilot) || 0;
            system.vehicle_stats.handling.base = handlingValues.base;
            system.vehicle_stats.off_road_handling.base = handlingValues.offRoad;
            system.vehicle_stats.speed.base = speedValues.base;
            system.vehicle_stats.off_road_speed.base = speedValues.offRoad;
            system.vehicle_stats.acceleration.base = accelerationValues.base;
            system.vehicle_stats.off_road_acceleration.base = accelerationValues.offRoad;
            system.vehicle_stats.sensor.base = Number(vehicle.sensor) || 0;
            system.vehicle_stats.seats.base = Number(vehicle.seats) || 0;

            system.cost = Number(vehicle.owncost?.replace(/[^\d.-]/g, "")) || 0;
            system.attributes.body.base = Number(vehicle.body) || 0;
            system.armor.rating.base = Number(vehicle.armor) || 0;
            system.availability = vehicle.avail || '';

            system.importFlags = {
                isFreshImport: true,
                sourceid: vehicle.sourceid || vehicle.guid || '',
                category: categoryName,
                name: vehicle.name || vehicle.name_english || vehicleActorData.name,
            };

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
