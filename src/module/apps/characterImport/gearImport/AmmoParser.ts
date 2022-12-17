import { BaseGearParser } from "./BaseGearParser"

/**
 * Parses ammunition
 */
export class AmmoParser extends BaseGearParser {
   
    parse(chummerGear : any) : any {
        const parsedGear =  super.parse(chummerGear);
        parsedGear.type = 'ammo';

        if (chummerGear.weaponbonusap) {
            parsedGear.system.ap = parseInt(chummerGear.weaponbonusap);
        }

        if (chummerGear.weaponbonusdamage) {
            parsedGear.system.damage = parseInt(chummerGear.weaponbonusdamage);

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

        return parsedGear;
    }
}