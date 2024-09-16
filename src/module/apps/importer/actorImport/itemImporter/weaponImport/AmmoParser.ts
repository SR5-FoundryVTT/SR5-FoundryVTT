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

           if (chummerGear.weaponbonusdamage.includes('S')) {
                parsedGear.system.damageType = 'stun';
            } else if (chummerGear.weaponbonusdamage.includes('M')) {
                parsedGear.system.damageType = 'matrix';
            }
            else {
                parsedGear.system.damageType = 'physical';
            }

            parsedGear.system.element = chummerGear.weaponbonusdamage_english.match(/\(e\)/)?.pop() === '(e)' ? 'electricity' : '';
        }

        parsedGear.system.accuracy = parseInt(chummerGear.weaponbonusacc);
        parsedGear.system.blast = {
                        radius: 0,
                        dropoff: 0
                    };
        parsedGear.system.replaceDamage = false;


        // Assign import flags
        parsedGear.system.importFlags = genImportFlags(formatAsSlug(chummerGear.name_english), parserType);
        this.setSubType(parsedGear, parserType, formatAsSlug(chummerGear.name_english.split(':')[0]));

        return parsedGear;
    }
}
