import { BaseGearParser } from "./BaseGearParser"
import { formatAsSlug, genImportFlags } from "../BaseParserFunctions.js"
import { SR5 } from "../../../config";

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

        let subType = formatAsSlug(chummerGear.name_english.split(':')[0]);
        if (Object.keys(SR5.itemSubTypeIconOverrides[parserType]).includes(subType)) {
            parsedGear.system.importFlags.subType = formatAsSlug(subType);
        }

        return parsedGear;
    }
}