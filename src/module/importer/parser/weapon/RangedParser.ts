import { ImportHelper } from '../../helper/ImportHelper';
import { WeaponParserBase } from './WeaponParserBase';
import { Constants } from '../../importer/Constants';
import DamageData = Shadowrun.DamageData;
import DamageType = Shadowrun.DamageType;
import {DataDefaults} from "../../../data/DataDefaults";
import WeaponItemData = Shadowrun.WeaponItemData;

export class RangedParser extends WeaponParserBase {
    public GetDamage(jsonData: object): DamageData {
        let jsonDamage = ImportHelper.StringValue(jsonData, 'damage');
        let damageCode = jsonDamage.match(/[0-9]+[PS]/g)?.[0];

        if (damageCode == null) {
            return DataDefaults.damageData();
        }

        let damageType = damageCode.includes('P') ? 'physical' : 'stun';
        let damageAmount = parseInt(damageCode.replace(damageType[0].toUpperCase(), ''));
        let damageAp = ImportHelper.IntValue(jsonData, 'ap', 0);

        const partialDamageData = {
            type: {
                base: damageType as DamageType,
                value: damageType as DamageType,
            },
            base: damageAmount,
            value: damageAmount,
            ap: {
                base: damageAp,
                value: damageAp,
                mod: []
            }
        }
        return DataDefaults.damageData(partialDamageData);
    }

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

        item.system.range.modes.single_shot = ImportHelper.StringValue(jsonData, 'mode').includes('SS');
        item.system.range.modes.semi_auto = ImportHelper.StringValue(jsonData, 'mode').includes('SA');
        item.system.range.modes.burst_fire = ImportHelper.StringValue(jsonData, 'mode').includes('BF');
        item.system.range.modes.full_auto = ImportHelper.StringValue(jsonData, 'mode').includes('FA');

        return item;
    }
}
