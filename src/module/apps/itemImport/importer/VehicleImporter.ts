import { DataImporter } from './DataImporter';
import { VehicleParser } from '../parser/vehicle/VehicleParser';
import { VehiclesSchema, Vehicle } from '../schema/VehiclesSchema';
import { CompendiumKey } from './Constants';

export class VehicleImporter extends DataImporter {
    public files = ["vehicles.xml"];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('vehicles') && jsonObject['vehicles'].hasOwnProperty('vehicle');
    }

    async Parse(jsonObject: VehiclesSchema): Promise<void> {
        return VehicleImporter.ParseItems<Vehicle, Shadowrun.VehicleActorData>(
            jsonObject.vehicles.vehicle,
            {
                compendiumKey: (jsonData: Vehicle) => {
                    return jsonData.category._TEXT.includes("Drone") ? "Drone" : "Vehicle";
                },
                parser: new VehicleParser(),
                errorPrefix: "Failed Parsing Vehicle"
            }
        );
    }
}
