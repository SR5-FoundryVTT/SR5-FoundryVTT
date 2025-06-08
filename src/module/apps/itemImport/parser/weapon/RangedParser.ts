import { WeaponParserBase } from './WeaponParserBase';
import WeaponItemData = Shadowrun.WeaponItemData;
import { DataDefaults } from '../../../../data/DataDefaults';
import { Weapon } from '../../schema/WeaponsSchema';

export class RangedParser extends WeaponParserBase {
    protected GetAmmo(weaponJson: Weapon) {
        const jsonAmmo = weaponJson.ammo._TEXT;
        const match = jsonAmmo.match(/([0-9]+)/g)?.[0];
        return match ? parseInt(match) : 0;
    }

    protected override getSystem(jsonData: Weapon): WeaponItemData['system'] {
        const system = super.getSystem(jsonData);

        // Some new weapons don't have any rc defined in XML.
        system.range.rc.base = Number(jsonData?.rc?._TEXT) || 0;
        system.range.rc.value = Number(jsonData?.rc?._TEXT) || 0;

        const rangeCategory = jsonData.range?._TEXT || jsonData.category._TEXT;
        system.range.ranges = DataDefaults.weaponRangeData(this.GetRangeDataFromImportedCategory(rangeCategory));

        system.ammo.current.value = this.GetAmmo(jsonData);
        system.ammo.current.max = this.GetAmmo(jsonData);

        const modeData = jsonData.mode._TEXT;
        system.range.modes = {
            single_shot: modeData.includes('SS'),
            semi_auto: modeData.includes('SA'),
            burst_fire: modeData.includes('BF'),
            full_auto: modeData.includes('FA'),
        };

        return system;
    }
}
