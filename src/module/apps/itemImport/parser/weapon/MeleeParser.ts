import { WeaponParserBase } from './WeaponParserBase';
import WeaponItemData = Shadowrun.WeaponItemData;
import { Weapon } from '../../schema/WeaponsSchema';

export class MeleeParser extends WeaponParserBase {
    protected override getSystem(jsonData: Weapon): WeaponItemData['system'] {
        const system = super.getSystem(jsonData);

        system.melee.reach = Number(jsonData.reach._TEXT);

        return system;
    }
}
