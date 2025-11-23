import { DataImporter } from './DataImporter';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { VehiclesSchema, Mod } from '../schema/VehiclesSchema';
import { VehicleModParser } from '../parser/mod/VehicleModParser';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class VehicleModImporter extends DataImporter {
    public readonly files = ['vehicles.xml'] as const;

    async _parse(jsonObject: VehiclesSchema): Promise<void> {
        IH.setTranslatedCategory('vehicles', jsonObject.modcategories.category);

        return VehicleModImporter.ParseItems<Mod>(
            jsonObject.mods.mod,
            {
                compendiumKey: () => "Vehicle_Mod",
                parser: new VehicleModParser(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: "Vehicle Mod"
            }
        );
    }
}
