import { ImportHelper } from '../../helper/ImportHelper';
import { WeaponParserBase } from './WeaponParserBase';
import { Constants } from '../../importer/Constants';
import BlastData = Shadowrun.BlastData;
import ActorAttribute = Shadowrun.ActorAttribute;
import DamageData = Shadowrun.DamageData;
import DamageType = Shadowrun.DamageType;
import {DataDefaults} from "../../../data/DataDefaults";
import WeaponItemData = Shadowrun.WeaponItemData;

export class ThrownParser extends WeaponParserBase {
    public GetDamage(jsonData: object): DamageData {
        let jsonDamage = ImportHelper.StringValue(jsonData, 'damage');

        let damageAmount = 0;
        let damageType = 'physical';
        let damageAttribute = '';

        //STR scaling weapons like the boomerang
        if (jsonDamage.includes('STR')) {
            damageAttribute = 'strength';

            let damageMatch = jsonDamage.match(/((STR)([+-])[0-9]\)[PS])/g)?.[0];
            if (damageMatch !== undefined) {
                let amountMatch = damageMatch.match(/-?[0-9]+/g)?.[0];
                damageAmount = amountMatch !== undefined ? parseInt(amountMatch) : 0;
            }
        } else {
            let damageMatch = jsonDamage.match(/([0-9]+[PS])/g)?.[0];

            if (damageMatch !== undefined) {
                let amountMatch = damageMatch.match(/[0-9]+/g)?.[0];
                if (amountMatch !== undefined) {
                    damageAmount = parseInt(amountMatch);
                }
            } else {
                const partialDamageData = {
                    type: {
                        base: 'physical' as DamageType,
                        value: 'physical' as DamageType
                    }
                }
                return DataDefaults.damageData(partialDamageData);
            }
        }
        damageType = jsonDamage.includes('P') ? 'physical' : 'stun';

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
                mod: [],
            },
            attribute: damageAttribute as ActorAttribute,
        }
        return DataDefaults.damageData(partialDamageData);
    }

    public GetBlast(jsonData: object, item: WeaponItemData): BlastData {
        let blastData: BlastData = {
            radius: 0,
            dropoff: 0,
        };

        let blastCode = ImportHelper.StringValue(jsonData, 'damage');

        let radiusMatch = blastCode.match(/([0-9]+m)/)?.[0];
        if (radiusMatch !== undefined) {
            radiusMatch = radiusMatch.match(/[0-9]+/)?.[0];
            if (radiusMatch !== undefined) {
                blastData.radius = parseInt(radiusMatch);
            }
        }

        let dropoffMatch = blastCode.match(/(-[0-9]+\/m)/)?.[0];
        if (dropoffMatch !== undefined) {
            dropoffMatch = dropoffMatch.match(/-[0-9]+/)?.[0];
            if (dropoffMatch !== undefined) {
                blastData.dropoff = parseInt(dropoffMatch);
            }
        }

        if (blastData.dropoff && !blastData.radius) {
            blastData.radius = -(item.system.action.damage.base / blastData.dropoff);
        }

        return blastData;
    }

    override Parse(jsonData: object, item: WeaponItemData, jsonTranslation?: object): WeaponItemData {
        item = super.Parse(jsonData, item, jsonTranslation);

        if (jsonData.hasOwnProperty('range')) {
            item.system.thrown.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, 'range')];
        } else {
            item.system.thrown.ranges = Constants.WEAPON_RANGES[ImportHelper.StringValue(jsonData, 'category')];
        }

        item.system.thrown.blast = this.GetBlast(jsonData, item);

        return item;
    }
}
