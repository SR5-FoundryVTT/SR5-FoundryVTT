import { Constants } from './Constants';
import { DataImporter } from './DataImporter';
import { WeaponModParser } from '../parser/mod/WeaponModParser';
import { Accessory, WeaponsSchema } from '../schema/WeaponsSchema';
import { UpdateActionFlow } from '../../../item/flows/UpdateActionFlow';

export class WeaponModImporter extends DataImporter {
    public files = ['weapons.xml'];

    CanParse(jsonObject: object): boolean {
        return jsonObject.hasOwnProperty('accessories') && jsonObject['accessories'].hasOwnProperty('accessory');
    }

    async Parse(jsonObject: WeaponsSchema): Promise<void> {
        const items = await WeaponModImporter.ParseItems<Accessory, Shadowrun.ModificationItemData>(
            jsonObject.accessories.accessory,
            {
                compendiumKey: "Item",
                parser: new WeaponModParser(),
                filter: jsonData => !DataImporter.unsupportedEntry(jsonData),
                injectActionTests: item => {
                    UpdateActionFlow.injectActionTestsIntoChangeData(item.type, item, item);
                },
                errorPrefix: "Failed Parsing Weapon Mod"
            }
        );

        // @ts-expect-error // TODO: TYPE: Remove this.
        await Item.create(items, { pack: Constants.MAP_COMPENDIUM_KEY['Item'].pack });
    }
}
