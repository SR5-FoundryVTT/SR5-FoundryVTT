import { DataImporter } from './DataImporter';
import { ArmorParser } from '../parser/armor/ArmorParser';
import { ArmorSchema, Armor } from '../schema/ArmorSchema';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class ArmorImporter extends DataImporter {
    public readonly files = ['armor.xml'] as const;

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('armors') && jsonObject['armors'].hasOwnProperty('armor');
    }

    async Parse(jsonObject: ArmorSchema): Promise<void> {
        IH.setTranslatedCategory('armor', jsonObject.categories.category);

        return ArmorImporter.ParseItems<Armor>(
            jsonObject.armors.armor,
            {
                compendiumKey: () => "Armor",
                parser: new ArmorParser(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: "Armor"
            }
        );
    }    
}
