import { importOptionsType } from "../../characterImporter/CharacterImporter";
import { getArray } from "../importHelper/BaseParserFunctions";
import { WeaponParser } from "../weaponImport/WeaponParser";
import { GearsParser } from "../importHelper/GearsParser";
import MountedWeaponParser from "./MountedWeaponParser";
import { SR5Actor } from '../../../../../actor/SR5Actor';
import VehicleModsParser from "./VehicleModsParser";
import { ActorSchema } from "../../ActorSchema";
import { Sanitizer } from "@/module/sanitizer/Sanitizer";

export default class VehicleParser {

    async parseVehicles(actor: SR5Actor<'character'>, chummerChar: ActorSchema, importOptions: importOptionsType): Promise<Array<SR5Actor>|undefined> {
        if(!importOptions.vehicles) {
            return;
        }

        if(!game.user?.can("ACTOR_CREATE")) {
            ui.notifications?.error(game.i18n.format("SR5.VehicleImport.MissingPermission"))
            return;
        }

        const vehicles = getArray(chummerChar.vehicles?.vehicle);

        return Promise.all<SR5Actor>(vehicles.map<Promise<SR5Actor>>(async (vehicle) => {
            const vehicleActor = (await SR5Actor.create({ name: vehicle.name, type: "vehicle" }) as SR5Actor<'vehicle'>);

            const items: Item.CreateData[] = [
                ...await new WeaponParser().parseWeapons(vehicle),
                ...await new GearsParser().parseItems(vehicle.gears?.gear),
                ...await new MountedWeaponParser().parseWeapons(vehicle),
                ...await new VehicleModsParser().parseItems(vehicle.mods?.mod)
            ];

            let handling: string | undefined;
            let off_road_handling: string | undefined;
            if(vehicle.handling.includes("/")) {
                handling = vehicle.handling.split("/")[0];
                off_road_handling =  vehicle.handling.split("/")[1]
            } else {
                handling = vehicle.handling
                off_road_handling =  vehicle.handling
            }

            let speed;
            let off_road_speed;
            if(vehicle.speed.includes("/")) {
                speed = vehicle.speed.split("/")[0];
                off_road_speed =  vehicle.speed.split("/")[1]
            } else {
                speed = vehicle.speed
                off_road_speed =  vehicle.speed
            }

            const system = {
                driver: actor.id,
                vehicle_stats: {
                    pilot: { base: Number(vehicle.pilot) || 0 },
                    handling: { base: Number(handling) || 0 },
                    off_road_handling: { base: Number(off_road_handling) || 0 },
                    speed: { base: Number(speed) || 0 },
                    off_road_speed: { base: Number(off_road_speed) || 0 },
                    acceleration: { base: Number(vehicle.accel) || 0 },
                    sensor: { base: Number(vehicle.sensor) || 0 },
                    seats: { base: Number(vehicle.seats) || 0 }
                },
                attributes: { body: { base: Number(vehicle.body) || 0 } },
                armor: { base: Number(vehicle.armor) || 0 },
                isDrone: vehicle.isdrone === "True"
            };

            const consoleLogs = Sanitizer.sanitize(CONFIG.Actor.dataModels.vehicle.schema, system);
            if (consoleLogs) {
                console.warn(`Document Sanitized on Import: Name: ${vehicle.name}\n`);
                console.table(consoleLogs);
            }

            await vehicleActor.update({
                system,
                folder: actor.folder?.id
            });

            await vehicleActor.createEmbeddedDocuments('Item', items);

            return vehicleActor;
        }));
    }
}
