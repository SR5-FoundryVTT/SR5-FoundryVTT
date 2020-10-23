import { ImportHelper } from '../../helper/ImportHelper';
import { WeaponParserBase } from './WeaponParserBase';
import ActorAttribute = Shadowrun.ActorAttribute;
import DamageData = Shadowrun.DamageData;
import DamageType = Shadowrun.DamageType;
import Weapon = Shadowrun.Weapon;

export class MeleeParser extends WeaponParserBase {
    GetDamage(jsonData: object): DamageData {
        let jsonDamage = ImportHelper.StringValue(jsonData, 'damage');
        let damageCode: any = jsonDamage.match(/(STR)([+-]?)([1-9]*)\)([PS])/g)?.[0];

        if (damageCode == null) {
            return {
                type: {
                    base: 'physical',
                    value: 'physical',
                },
                element: {
                    base: '',
                    value: '',
                },
                base: 0,
                value: 0,
                ap: {
                    base: 0,
                    value: 0,
                    mod: [],
                },
                attribute: '',
                mod: [],
            };
        }

        let damageBase = 0;
        let damageAp = ImportHelper.IntValue(jsonData, 'ap', 0);

        let splitDamageCode = damageCode.split(')');
        let damageType = splitDamageCode[1].includes('P') ? 'physical' : 'stun';

        let splitBaseCode = damageCode.includes('+') ? splitDamageCode[0].split('+') : splitDamageCode[0].split('-');
        if (splitDamageCode[0].includes('+') || splitDamageCode[0].includes('-')) {
            damageBase = parseInt(splitBaseCode[1], 0);
        }
        let damageAttribute = damageCode.includes('STR') ? 'strength' : '';

        return {
            type: {
                base: damageType as DamageType,
                value: damageType as DamageType,
            },
            element: {
                base: '',
                value: '',
            },
            base: damageBase,
            value: damageBase,
            ap: {
                base: damageAp,
                value: damageAp,
                mod: [],
            },
            attribute: damageAttribute as ActorAttribute,
            mod: [],
        };
    }

    Parse(jsonData: object, data: Weapon, jsonTranslation?: object): Weapon {
        data = super.Parse(jsonData, data, jsonTranslation);

        data.data.melee.reach = ImportHelper.IntValue(jsonData, 'reach');

        return data;
    }
}
