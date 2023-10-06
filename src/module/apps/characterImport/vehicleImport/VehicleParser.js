import { getArray } from "../BaseParserFunctions.js"

export default class VehicleParser {

    async parseVehicles(actor, chummerChar, importOptions) {
        console.log(importOptions.vehicles)
        if(!game.user.can("ACTOR_CREATE")) {
            ui.notifications.error(game.i18n.format("SR5.VehicleImport.MissingPermission"))
            return;
        }

        if(!importOptions.vehicles) {
            return;
        }

        const vehicles = getArray(chummerChar.vehicles?.vehicle);

        for(let vehicle of vehicles) {
            let vehicleActor = await Actor.create({
                name: vehicle.name,
                type: "vehicle"
            });


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


            vehicleActor.update({
                'system.driver': actor.id,
                'system.vehicle_stats.pilot.base': vehicle.pilot,
                'system.vehicle_stats.handling.base': handling,
                'system.vehicle_stats.off_road_handling.base': off_road_handling,
                'system.vehicle_stats.speed.base': speed,
                'system.vehicle_stats.off_road_speed.base': off_road_speed,
                'system.vehicle_stats.acceleration.base': vehicle.accel,
                'system.vehicle_stats.sensor.base': vehicle.sensor,
                'system.attributes.body.base': vehicle.body,
            
                'system.armor.base': vehicle.armor,
                'system.isDrone': vehicle.isdrone
            });
        }
    }
}
