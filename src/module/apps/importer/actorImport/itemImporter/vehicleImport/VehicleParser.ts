import { getArray } from "../importHelper/BaseParserFunctions.js";
import { WeaponParser } from "../weaponImport/WeaponParser";
import { GearsParser } from "../importHelper/GearsParser.js";
import MountedWeaponParser from "./MountedWeaponParser";
import VehicleModsParser from "./VehicleModsParser";
import { SR5Actor } from '../../../../../actor/SR5Actor';

export default class VehicleParser {

    async parseVehicles(actor, chummerChar, importOptions): Promise<Array<SR5Actor>|undefined> {
        if(!importOptions.vehicles) {
            return;
        }

        if(!game.user?.can("ACTOR_CREATE")) {
            ui.notifications?.error(game.i18n.format("SR5.VehicleImport.MissingPermission"))
            return;
        }

        const vehicles = getArray(chummerChar.vehicles?.vehicle);

        return await Promise.all<SR5Actor>(vehicles.map<Promise<SR5Actor>>(async (vehicle) => {
            const vehicleActor = (await Actor.create({
                name: vehicle.name,
                type: "vehicle"
            }))!;

            const promises : Array<Promise<any>> = [];
            promises.push(new WeaponParser().parseWeapons(vehicle, importOptions.assignIcons));
            promises.push(new GearsParser().parseGears(getArray(vehicle.gears?.gear),  importOptions.assignIcons));
            promises.push(new MountedWeaponParser().parseWeapons(vehicle, importOptions.assignIcons))
            promises.push(new VehicleModsParser().parseMods(vehicle, importOptions.assignIcons))

            let handling;
            let off_road_handling;
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

            await vehicleActor.update({
                // @ts-expect-error
                'system.driver': actor.id,
                'system.vehicle_stats.pilot.base': vehicle.pilot,
                'system.vehicle_stats.handling.base': handling,
                'system.vehicle_stats.off_road_handling.base': off_road_handling,
                'system.vehicle_stats.speed.base': speed,
                'system.vehicle_stats.off_road_speed.base': off_road_speed,
                'system.vehicle_stats.acceleration.base': vehicle.accel,
                'system.vehicle_stats.sensor.base': vehicle.sensor,
                'system.vehicle_stats.seats.base': vehicle.seats,
                'system.attributes.body.base': vehicle.body,
                'system.armor.base': vehicle.armor,
                'system.isDrone': vehicle.isdrone === "True",
                'folder': actor.folder?.id
            });

            await vehicleActor.createEmbeddedDocuments('Item', (await Promise.all(promises)).flat());

            return vehicleActor;
        }));
    }
}
