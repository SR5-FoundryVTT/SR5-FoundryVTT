import { DataImporter } from './DataImporter';
import { VehiclesSchema, Mod } from '../schema/VehiclesSchema';
import { VehicleModParser } from '../parser/mod/VehicleModParser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class VehicleModImporter extends DataImporter {
    public files = ['vehicles.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('mods') && jsonObject['mods'].hasOwnProperty('mod');
    }

    async Parse(jsonObject: VehiclesSchema): Promise<void> {
        return VehicleModImporter.ParseItems<Mod>(
            jsonObject.mods.mod,
            {
                compendiumKey: "Modification",
                parser: new VehicleModParser(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type!, item, item);
                },
                errorPrefix: "Failed Parsing Vehicle Mod"
            }
        );
    }
}
