import { DataImporter } from './DataImporter';
import { WeaponModParser } from '../parser/mod/WeaponModParser';
import { Accessory, WeaponsSchema } from '../schema/WeaponsSchema';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class WeaponModImporter extends DataImporter {
    public readonly files = ['weapons.xml'] as const;

    async _parse(jsonObject: WeaponsSchema): Promise<void> {
        return WeaponModImporter.ParseItems<Accessory>(
            jsonObject.accessories.accessory,
            {
                compendiumKey: () => "Weapon_Mod",
                parser: new WeaponModParser(),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                documentType: "Weapon Mod"
            }
        );
    }
}
