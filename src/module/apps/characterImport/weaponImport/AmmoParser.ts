import { BaseGearParser } from "../importHelper/BaseGearParser"
import { formatAsSlug, genImportFlags } from "../importHelper/BaseParserFunctions.js"

/**
 * Parses ammunition
 */
export class AmmoParser extends BaseGearParser {

    override parse(chummerGear : any) : any {
        const parserType = 'ammo';
        const parsedGear =  super.parse(chummerGear);
        parsedGear.type = parserType;

        if (chummerGear.weaponbonusap) {
            parsedGear.system.ap = parseInt(chummerGear.weaponbonusap);
        }

        if (chummerGear.weaponbonusdamage) {
            parsedGear.system.damage = parseInt(chummerGear.weaponbonusdamage_english);

            if (chummerGear.weaponbonusdamage.includes('P')) {
                parsedGear.system.damageType = 'physical';
            } else if (chummerGear.weaponbonusdamage.includes('S')) {
                parsedGear.system.damageType = 'stun';
            } else if (chummerGear.weaponbonusdamage.includes('M')) {
                parsedGear.system.damageType = 'matrix';
            }
            else {
                parsedGear.system.damageType = 'physical';
            }
        }

        // Assign import flags
        parsedGear.system.importFlags = genImportFlags(formatAsSlug(chummerGear.name_english), parserType);
        this.setSubType(parsedGear, parserType, formatAsSlug(chummerGear.name_english.split(':')[0]));

        return parsedGear;
    }
}