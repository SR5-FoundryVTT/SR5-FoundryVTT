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
        return await ArmorImporter.ParseItems<Armor, Shadowrun.ArmorItemData>(
            jsonObject.armors.armor,
            {
                compendiumKey: "Gear",
                parser: new ArmorParser(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Armor"
            }
        );
    }    
}
