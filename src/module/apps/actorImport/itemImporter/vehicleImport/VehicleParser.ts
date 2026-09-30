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

    // Helper regex tester ensuring isolated word or bounded path
    const testPattern = (pattern: RegExp) => pattern.test(lower);

    // 1. Drone size patterns (handling paths like drone/micro, drones-micro, Drones: Micro, etc.)
    if (testPattern(/\b(drone\/micro|drones-micro)\b/) || (testPattern(/\bmicro\b/) && testPattern(/\bdrones?\b/))) return 'micro_drone';
    if (testPattern(/\b(drone\/mini|drones-mini)\b/) || (testPattern(/\bmini\b/) && testPattern(/\bdrones?\b/))) return 'mini_drone';
    if (testPattern(/\b(drone\/small|drones-small)\b/) || (testPattern(/\bsmall\b/) && testPattern(/\bdrones?\b/))) return 'small_drone';
    if (testPattern(/\b(drone\/medium|drones-medium)\b/) || (testPattern(/\bmedium\b/) && testPattern(/\bdrones?\b/))) return 'medium_drone';
    if (testPattern(/\b(drone\/large|drones-large)\b/) || (testPattern(/\blarge\b/) && testPattern(/\bdrones?\b/))) return 'large_drone';
    if (testPattern(/\b(drone\/huge|drones-huge)\b/) || (testPattern(/\bhuge\b/) && testPattern(/\bdrones?\b/))) return 'huge_drone';
    if (testPattern(/\b(drone\/anthro|drones-anthro)\b/) || (testPattern(/\b(anthro|humanoid)\b/) && testPattern(/\bdrones?\b/))) return 'anthro_drone';
    if (testPattern(/\b(drones-missile|ammo\/missile)\b/) || (testPattern(/\bmissile\b/) && testPattern(/\bdrones?\b/))) return 'missile_drone';

    // 2. Specific watercraft special cases: jet-ski / waverunner is a boat, not aircraft!
    if (testPattern(/\b(jet-?ski|jetski|waverunner|seadoo|sea-doo)\b/)) return 'boat';

    // 3. Submarine (ensure word boundary so 'suburban' does not match 'sub'!)
    if (testPattern(/\b(submarine|u-boot|tauchboot)\b/) || testPattern(/vehicle\/submarine/) || testPattern(/\bsub\b(?!\s*urban)/)) return 'submarine';

    // 4. Rotorcraft / Helicopter
    if (testPattern(/\b(rotorcraft|rotary|helicopter|hubschrauber|tiltrotor)\b/) || testPattern(/vehicle\/rotorcraft/) || testPattern(/\b(heli|copter|helo)\b/)) return 'rotorcraft';

    // 5. VTOL / VSTOL
    if (testPattern(/\b(vtol|v\/stol)\b/) || testPattern(/vehicle\/vtol/)) return 'vtol';

    // 6. LTAV / Airship
    if (testPattern(/\b(ltav|blimp|zeppelin|airship)\b/) || testPattern(/vehicle\/ltav/)) return 'ltav';

    // 7. Hovercraft
    if (testPattern(/\b(hovercraft|luftkissen|skimmer)\b/) || testPattern(/vehicle\/hovercraft/)) return 'hovercraft';

    // 8. Glider
    if (testPattern(/\b(glider|segelflug)\b/)) return 'glider';

    // 9. Walker
    if (testPattern(/\b(walker|läufer|mech)\b/)) return 'walker';

    // 10. Aircraft / Fixed-wing (isolated 'jet', 'plane', etc. - excluding jet-ski already handled above)
    if (testPattern(/\b(fixed-wing|aircraft|airplane|flugzeug|aeroplane)\b/) || testPattern(/vehicle\/airplane/) || testPattern(/\b(plane|jet)\b/)) return 'aircraft';

    // 11. Motorcycle / Bike
    if (testPattern(/\b(motorcycle|motorrad|moped|scooter|chopper)\b/) || testPattern(/vehicle\/bike/) || testPattern(/\b(bikes?|scoot)\b/)) return 'motorcycle';

    // 12. Boat / Ship (excluding airship already handled above)
    if (testPattern(/\b(boat|schiff|ship|boot|yacht|vessel|watercraft)\b/) || testPattern(/vehicle\/boat/)) return 'boat';

    // 13. Heavy equipment / Construction
    if (testPattern(/\b(heavy[ -]?equipment|construction|municipal|baustelle|excavator|crane)\b/) || testPattern(/vehicle\/construction/)) return 'heavy_equipment';

    // 14. Military / Security
    if (testPattern(/\b(military|militär|tank|apc|panzer|police|corpsec)\b/) || testPattern(/vehicle\/military/)) return 'military';

    // 15. Commercial
    if (testPattern(/\b(commercial|nutzfahrzeug|bus|taxi|cab)\b/)) return 'commercial';

    // 16. Truck / Van (including suburban)
    if (testPattern(/\b(truck|lkw|transporter|pickup|van|suburban)\b/) || testPattern(/vehicle\/truck/)) return 'truck';

    // 17. Car / Automobile
    if (testPattern(/\b(car|auto|pkw|sedan|coupe|automobile|suv|limousine)\b/) || testPattern(/vehicle\/car/)) return 'car';

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
