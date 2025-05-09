import { Constants } from './Constants';
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
        const items = await VehicleModImporter.ParseItems<Mod, Shadowrun.ModificationItemData>(
            jsonObject.mods.mod,
            {
                compendiumKey: "Item",
                parser: new VehicleModParser(),
                filter: jsonData => !DataImporter.unsupportedEntry(jsonData),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Vehicle Mod"
            }
        );

        // @ts-expect-error // TODO: TYPE: Remove this.
        await Item.create(items, { pack: Constants.MAP_COMPENDIUM_KEY['Item'].pack });
    }
}
