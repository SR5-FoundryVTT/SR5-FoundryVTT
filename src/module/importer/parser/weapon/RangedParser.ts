import { ImportHelper } from '../../helper/ImportHelper';
import { WeaponParserBase } from './WeaponParserBase';
import { Constants } from '../../importer/Constants';
import DamageData = Shadowrun.DamageData;
import DamageType = Shadowrun.DamageType;
import {DataDefaults} from "../../../data/DataDefaults";
import WeaponItemData = Shadowrun.WeaponItemData;

export class RangedParser extends WeaponParserBase {
    protected GetAmmo(weaponJson: object) {
        let jsonAmmo = ImportHelper.StringValue(weaponJson, 'ammo');
        let match = jsonAmmo.match(/([0-9]+)/g)?.[0];
        return match !== undefined ? parseInt(match) : 0;
    }

    override Parse(jsonData: object, item: WeaponItemData, jsonTranslation?: object): WeaponItemData {
        item = super.Parse(jsonData, item, jsonTranslation);

        // Some new weapons don't have any rc defined in XML.
        if (jsonData.hasOwnProperty('rc')) {
            item.system.range.rc.base = ImportHelper.IntValue(jsonData, 'rc');
            item.system.range.rc.value = ImportHelper.IntValue(jsonData, 'rc');
        } else {
            item.system.range.rc.base = 0;
            item.system.range.rc.value = 0;
        }
        

        if (jsonData.hasOwnProperty('range')) {
            item.system.range.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, 'range')];
        } else {
            item.system.range.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, 'category')];
        }

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
