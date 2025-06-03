import { Weapon } from '../../schema/WeaponsSchema';
import { WeaponParserBase } from './WeaponParserBase';

export class MeleeParser extends WeaponParserBase {
    protected override getSystem(jsonData: Weapon): Item.SystemOfType<'weapon'> {
        const system = super.getSystem(jsonData);

        system.melee.reach = Number(jsonData.reach._TEXT);

        return system;
    }
}
