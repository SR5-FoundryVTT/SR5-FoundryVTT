import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { VehicleParser } from '../parser/vehicle/VehicleParser';
import { VehiclesSchema, Vehicle } from '../schema/VehiclesSchema';

export class VehicleImporter extends DataImporter {
    public readonly files = ["vehicles.xml"] as const;

    async _parse(jsonObject: VehiclesSchema): Promise<void> {
        IH.setTranslatedCategory('vehicles', jsonObject.categories.category);

        return VehicleImporter.ParseItems<Vehicle>(
            jsonObject.vehicles.vehicle,
            {
                compendiumKey: (jsonData: Vehicle) => {
                    return jsonData.category._TEXT.includes("Drone") ? "Drone" : "Vehicle";
                },
                parser: new VehicleParser(),
                documentType: "Vehicle"
            }
        );
    }
}
