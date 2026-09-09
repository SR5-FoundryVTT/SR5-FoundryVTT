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

export function parseVehicleSubCategory(input: string): string {
    if (!input || typeof input !== 'string') return '';
    const lower = input.toLowerCase().trim();

    // Direct key matches
    const validSubCategories = [
        'bike', 'motorcycle', 'car', 'truck', 'boat', 'submarine',
        'aircraft', 'rotorcraft', 'vtol', 'hovercraft', 'ltav', 'glider',
        'walker', 'heavy_equipment', 'military', 'commercial',
        'micro_drone', 'mini_drone', 'small_drone', 'medium_drone',
        'large_drone', 'huge_drone', 'anthro_drone', 'missile_drone'
    ];
    if (validSubCategories.includes(lower)) return lower;

    // Drone size patterns (handling paths like drone/micro, drones-micro, Drones: Micro, etc.)
    if (lower.includes('micro') && (lower.includes('drone') || lower.includes('drones'))) return 'micro_drone';
    if (lower.includes('mini') && (lower.includes('drone') || lower.includes('drones'))) return 'mini_drone';
    if (lower.includes('small') && (lower.includes('drone') || lower.includes('drones'))) return 'small_drone';
    if (lower.includes('medium') && (lower.includes('drone') || lower.includes('drones'))) return 'medium_drone';
    if (lower.includes('large') && (lower.includes('drone') || lower.includes('drones'))) return 'large_drone';
    if (lower.includes('huge') && (lower.includes('drone') || lower.includes('drones'))) return 'huge_drone';
    if ((lower.includes('anthro') || lower.includes('humanoid')) && (lower.includes('drone') || lower.includes('drones'))) return 'anthro_drone';
    if (lower.includes('missile') && (lower.includes('drone') || lower.includes('drones'))) return 'missile_drone';

    if (lower.includes('drone/micro') || lower.includes('drones-micro')) return 'micro_drone';
    if (lower.includes('drone/mini') || lower.includes('drones-mini')) return 'mini_drone';
    if (lower.includes('drone/small') || lower.includes('drones-small')) return 'small_drone';
    if (lower.includes('drone/medium') || lower.includes('drones-medium')) return 'medium_drone';
    if (lower.includes('drone/large') || lower.includes('drones-large')) return 'large_drone';
    if (lower.includes('drone/huge') || lower.includes('drones-huge')) return 'huge_drone';
    if (lower.includes('drone/anthro') || lower.includes('drones-anthro')) return 'anthro_drone';

    // Vehicles (including icon paths, English/German Chummer categories, image filenames, name keywords)
    if (lower.includes('motorcycle') || lower.includes('bikes') || lower.includes('bike') || lower.includes('motorrad') || lower.includes('vehicle/bike') || lower.includes('scooter') || lower.includes('chopper')) return 'motorcycle';
    if (lower.includes('car') || lower.includes('auto') || lower.includes('pkw') || lower.includes('vehicle/car') || lower.includes('sedan') || lower.includes('coupe') || lower.includes('automobile')) return 'car';
    if (lower.includes('truck') || lower.includes('lkw') || lower.includes('transporter') || lower.includes('vehicle/truck') || lower.includes('pickup') || lower.includes('van')) return 'truck';
    if (lower.includes('boat') || lower.includes('schiff') || lower.includes('ship') || lower.includes('boot') || lower.includes('vehicle/boat') || lower.includes('yacht') || lower.includes('vessel')) return 'boat';
    if (lower.includes('submarine') || lower.includes('u-boot') || lower.includes('vehicle/submarine') || lower.includes('sub') || lower.includes('tauchboot')) return 'submarine';
    if (lower.includes('rotorcraft') || lower.includes('rotary') || lower.includes('helicopter') || lower.includes('heli') || lower.includes('copter') || lower.includes('chopper') || lower.includes('helo') || lower.includes('hubschrauber') || lower.includes('vehicle/rotorcraft')) return 'rotorcraft';
    if (lower.includes('vtol') || lower.includes('v/stol') || lower.includes('tiltrotor') || lower.includes('vehicle/vtol')) return 'vtol';
    if (lower.includes('hovercraft') || lower.includes('luftkissen') || lower.includes('skimmer') || lower.includes('vehicle/hovercraft')) return 'hovercraft';
    if (lower.includes('ltav') || lower.includes('blimp') || lower.includes('zeppelin') || lower.includes('airship') || lower.includes('vehicle/ltav')) return 'ltav';
    if (lower.includes('glider') || lower.includes('segelflug')) return 'glider';
    if (lower.includes('walker') || lower.includes('läufer') || lower.includes('mech')) return 'walker';
    if (lower.includes('fixed-wing') || lower.includes('aircraft') || lower.includes('airplane') || lower.includes('flugzeug') || lower.includes('plane') || lower.includes('jet') || lower.includes('vehicle/airplane')) return 'aircraft';
    if (lower.includes('construction') || lower.includes('municipal') || lower.includes('baustelle') || lower.includes('heavy equipment') || lower.includes('vehicle/construction') || lower.includes('excavator') || lower.includes('crane')) return 'heavy_equipment';
    if (lower.includes('military') || lower.includes('police') || lower.includes('corpsec') || lower.includes('militär') || lower.includes('vehicle/military') || lower.includes('tank') || lower.includes('apc') || lower.includes('panzer')) return 'military';
    if (lower.includes('commercial') || lower.includes('nutzfahrzeug') || lower.includes('bus') || lower.includes('taxi') || lower.includes('cab')) return 'commercial';

    // Standalone drone size fallback if category string is just size
    if (lower === 'micro') return 'micro_drone';
    if (lower === 'mini') return 'mini_drone';
    if (lower === 'small') return 'small_drone';
    if (lower === 'medium') return 'medium_drone';
    if (lower === 'large') return 'large_drone';
    if (lower === 'huge') return 'huge_drone';
    if (lower === 'anthro') return 'anthro_drone';
    if (lower === 'missile') return 'missile_drone';

    return '';
}

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

            system.subCategory = parseVehicleSubCategory(categoryName) as typeof system.subCategory;

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
