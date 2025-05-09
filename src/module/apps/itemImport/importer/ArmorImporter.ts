import { Constants } from './Constants';
import { DataImporter } from './DataImporter';
import { ArmorParser } from '../parser/armor/ArmorParser';
import { ArmorSchema, Armor } from '../schema/ArmorSchema';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class ArmorImporter extends DataImporter {
    public files = ['armor.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('armors') && jsonObject['armors'].hasOwnProperty('armor');
    }

    async Parse(jsonObject: ArmorSchema): Promise<void> {
        const items = await ArmorImporter.ParseItems<Armor, Shadowrun.ArmorItemData>(
            jsonObject.armors.armor,
            {
                compendiumKey: "Item",
                parser: new ArmorParser(),
                filter: jsonData => !ArmorImporter.unsupportedEntry(jsonData),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Armor"
            }
        );

        // @ts-expect-error
        await Item.create(items, { pack: Constants.MAP_COMPENDIUM_KEY['Item'].pack });
    }    
}
