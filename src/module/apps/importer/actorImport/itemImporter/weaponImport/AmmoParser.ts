import { DataDefaults } from "src/module/data/DataDefaults";
import { BaseGearParser } from "../importHelper/BaseGearParser"
import { formatAsSlug, genImportFlags, parseDescription, parseTechnology } from "../importHelper/BaseParserFunctions.js"
import { ActorSchema } from "../../ActorSchema";
import { Unwrap } from "../ItemsParser";

/**
 * Parses ammunition
 */
export class AmmoParser extends BaseGearParser {

    override parse(chummerGear: Unwrap<NonNullable<ActorSchema['gears']>['gear']>) {
        const parserType = 'ammo';
        const parsedGear = DataDefaults.baseEntityData("ammo");

        parsedGear.system.technology = parseTechnology(chummerGear);
        parsedGear.system.description = parseDescription(chummerGear);

        if (chummerGear.weaponbonusap)
            parsedGear.system.ap = Number(chummerGear.weaponbonusap) || 0;

        if (chummerGear.weaponbonusdamage) {
            parsedGear.system.damage = Number(chummerGear.weaponbonusdamage_english) || 0;

            if (chummerGear.weaponbonusdamage.includes('S'))
                parsedGear.system.damageType = 'stun';
            else if (chummerGear.weaponbonusdamage.includes('M'))
                parsedGear.system.damageType = 'matrix';
            else
                parsedGear.system.damageType = 'physical';

            parsedGear.system.element = (chummerGear.weaponbonusdamage_english || '').match(/\(e\)/)?.pop() == '(e)' ? 'electricity' : '';
        }

        parsedGear.system.accuracy = Number(chummerGear.weaponbonusacc) || 0;
        parsedGear.system.blast = { radius: 0, dropoff: 0 };
        parsedGear.system.replaceDamage = false;

        // Assign import flags
        parsedGear.system.importFlags = genImportFlags(formatAsSlug(chummerGear.name_english), parserType);
        this.setSubType(parsedGear, parserType, formatAsSlug(chummerGear.name_english.split(':')[0]));

        return parsedGear;
    }
}
