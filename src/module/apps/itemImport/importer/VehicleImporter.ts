import { DataImporter } from './DataImporter';
import { VehicleParser } from '../parser/vehicle/VehicleParser';
import { VehiclesSchema, Vehicle } from '../schema/VehiclesSchema';

export class VehicleImporter extends DataImporter {
    public files = ["vehicles.xml"];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('vehicles') && jsonObject['vehicles'].hasOwnProperty('vehicle');
    }

    async Parse(jsonObject: VehiclesSchema): Promise<void> {
        return VehicleImporter.ParseItems<Vehicle>(
            jsonObject.vehicles.vehicle,
            {
                compendiumKey: "Drone",
                parser: new VehicleParser(),
                errorPrefix: "Failed Parsing Vehicle"
            }
        );
    }
}
