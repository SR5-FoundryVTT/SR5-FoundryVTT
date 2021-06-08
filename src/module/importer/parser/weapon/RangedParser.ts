import { ImportHelper } from '../../helper/ImportHelper';
import { WeaponParserBase } from './WeaponParserBase';
import { Constants } from '../../importer/Constants';
import DamageData = Shadowrun.DamageData;
import DamageType = Shadowrun.DamageType;
import {DefaultValues} from "../../../data/DataDefaults";
import WeaponItemData = Shadowrun.WeaponItemData;

export class RangedParser extends WeaponParserBase {
    public GetDamage(jsonData: object): DamageData {
        let jsonDamage = ImportHelper.StringValue(jsonData, 'damage');
        let damageCode = jsonDamage.match(/[0-9]+[PS]/g)?.[0];

        if (damageCode == null) {
            return DefaultValues.damageData();
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
        return DefaultValues.damageData(partialDamageData);
    }

    protected GetAmmo(weaponJson: object) {
        let jsonAmmo = ImportHelper.StringValue(weaponJson, 'ammo');
        let match = jsonAmmo.match(/([0-9]+)/g)?.[0];
        return match !== undefined ? parseInt(match) : 0;
    }

    Parse(jsonData: object, data: WeaponItemData, jsonTranslation?: object): WeaponItemData {
        data = super.Parse(jsonData, data, jsonTranslation);

        data.data.range.rc.base = ImportHelper.IntValue(jsonData, 'rc');
        data.data.range.rc.value = ImportHelper.IntValue(jsonData, 'rc');

        if (jsonData.hasOwnProperty('range')) {
            data.data.range.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, 'range')];
        } else {
            data.data.range.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, 'category')];
        }

        data.data.ammo.current.value = this.GetAmmo(jsonData);
        data.data.ammo.current.max = this.GetAmmo(jsonData);

        data.data.range.modes.single_shot = ImportHelper.StringValue(jsonData, 'mode').includes('SS');
        data.data.range.modes.semi_auto = ImportHelper.StringValue(jsonData, 'mode').includes('SA');
        data.data.range.modes.burst_fire = ImportHelper.StringValue(jsonData, 'mode').includes('BF');
        data.data.range.modes.full_auto = ImportHelper.StringValue(jsonData, 'mode').includes('FA');

        return data;
    }
}
