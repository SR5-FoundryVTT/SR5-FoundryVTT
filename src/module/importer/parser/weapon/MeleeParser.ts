import { ImportHelper } from '../../helper/ImportHelper';
import { WeaponParserBase } from './WeaponParserBase';
import WeaponItemData = Shadowrun.WeaponItemData;

export class MeleeParser extends WeaponParserBase {
    override Parse(jsonData: object, item: WeaponItemData, jsonTranslation?: object): WeaponItemData {
        item = super.Parse(jsonData, item, jsonTranslation);

        item.system.melee.reach = ImportHelper.IntValue(jsonData, 'reach');

        return item;
    }
}
