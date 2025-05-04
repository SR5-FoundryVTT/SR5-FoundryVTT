import { ImportHelper } from '../../helper/ImportHelper';
import { WeaponParserBase } from './WeaponParserBase';
import WeaponItemData = Shadowrun.WeaponItemData;
import { DataDefaults } from '../../../../data/DataDefaults';
import { Weapon } from '../../schema/WeaponsSchema';

export class RangedParser extends WeaponParserBase {
    protected GetAmmo(weaponJson: Weapon) {
        let jsonAmmo = ImportHelper.StringValue(weaponJson, 'ammo');
        let match = jsonAmmo.match(/([0-9]+)/g)?.[0];
        return match !== undefined ? parseInt(match) : 0;
    }

    override async Parse(jsonData: Weapon, item: WeaponItemData, jsonTranslation?: object): Promise<WeaponItemData> {
        item = await super.Parse(jsonData, item, jsonTranslation);

        // Some new weapons don't have any rc defined in XML.
        if (jsonData.hasOwnProperty('rc')) {
            item.system.range.rc.base = ImportHelper.IntValue(jsonData, 'rc');
            item.system.range.rc.value = ImportHelper.IntValue(jsonData, 'rc');
        } else {
            item.system.range.rc.base = 0;
            item.system.range.rc.value = 0;
        }

        const rangeCategory = ImportHelper.StringValue(jsonData, jsonData.hasOwnProperty('range') ? 'range' : 'category');
        item.system.range.ranges = DataDefaults.weaponRangeData(this.GetRangeDataFromImportedCategory(rangeCategory));

        item.system.ammo.current.value = this.GetAmmo(jsonData);
        item.system.ammo.current.max = this.GetAmmo(jsonData);

        const modeData = ImportHelper.StringValue(jsonData, 'mode');
        item.system.range.modes = {
            single_shot: modeData.includes('SS'),
            semi_auto: modeData.includes('SA'),
            burst_fire: modeData.includes('BF'),
            full_auto: modeData.includes('FA'),
        };

        return item;
    }
}
