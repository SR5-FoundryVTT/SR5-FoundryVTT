import { Constants } from './Constants';
import { DataImporter } from './DataImporter';
import { VehicleParser } from '../parser/vehicle/VehicleParser';
import { VehiclesSchema, Vehicle } from '../schema/VehiclesSchema';

export class VehicleImporter extends DataImporter {
    public files = ["vehicles.xml"];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('vehicles') && jsonObject['vehicles'].hasOwnProperty('vehicle');
    }

    async Parse(jsonObject: VehiclesSchema): Promise<void> {
        const actors = await VehicleImporter.ParseItems<Vehicle, Shadowrun.VehicleActorData>(
            jsonObject.vehicles.vehicle,
            {
                compendiumKey: "Drone",
                parser: new VehicleParser(),
                filter: jsonData => !DataImporter.unsupportedEntry(jsonData),
                errorPrefix: "Failed Parsing Vehicle"
            }
        );

        // @ts-expect-error // TODO: TYPE: Remove this.
        await Actor.create(actors, { pack: Constants.MAP_COMPENDIUM_KEY['Drone'].pack });
    }
}
