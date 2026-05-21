import { DataImporter } from './DataImporter';
import { Gear, GearSchema } from '../schema/GearSchema';
import { ArmorSchema, Mod as ArmorMod } from '../schema/ArmorSchema';
import { ImportHelper as IH } from '../helper/ImportHelper';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';
import { ArmorModParser } from '../parser/mod/ArmorModParser';

export class ArmorModImporter extends DataImporter {
    public readonly files = ['armor.xml', 'gear.xml'] as const;

    async _parse(jsonObject: ArmorSchema | GearSchema): Promise<void> {
        if ('modcategories' in jsonObject) {
            IH.setTranslatedCategory('armor', jsonObject.modcategories.category);
        } else {
            IH.setTranslatedCategory('armor', jsonObject.categories.category);
        }

        const itemsList = 'mods' in jsonObject
            ? jsonObject.mods.mod
            : jsonObject.gears.gear.filter(gear => gear.armorcapacity);

        return ArmorModImporter.ParseItems<ArmorMod | Gear>(
            itemsList,
            {
                compendiumKey: () => "Armor_Mod",
                parser: new ArmorModParser(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: "Armor Mod"
            }
        );
    }
}
