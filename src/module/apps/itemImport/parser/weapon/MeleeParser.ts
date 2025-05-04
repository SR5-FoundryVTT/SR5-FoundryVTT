import { ImportHelper } from '../../helper/ImportHelper';
import { WeaponParserBase } from './WeaponParserBase';
import WeaponItemData = Shadowrun.WeaponItemData;
import { Weapon } from '../../schema/WeaponsSchema';

export class MeleeParser extends WeaponParserBase {
    override async Parse(jsonData: Weapon, item: WeaponItemData, jsonTranslation?: object): Promise<WeaponItemData> {
        item = await super.Parse(jsonData, item, jsonTranslation);

        item.system.melee.reach = ImportHelper.IntValue(jsonData, 'reach');

        return item;
    }
}
