import { BaseGearParser } from "./BaseGearParser"

/**
 * Parses ammunition
 */
export class AmmoParser extends BaseGearParser {
   
    parse(chummerGear : any) : any {
        const parsedGear =  super.parse(chummerGear);
        parsedGear.type = 'ammo';

        if (chummerGear.weaponbonusap) {
            parsedGear.data.ap = parseInt(chummerGear.weaponbonusap);
        }

        if (chummerGear.weaponbonusdamage) {
            parsedGear.data.damage = parseInt(chummerGear.weaponbonusdamage);

            if (chummerGear.weaponbonusdamage.includes('P')) {
                parsedGear.data.damageType = 'physical';
            } else if (chummerGear.weaponbonusdamage.includes('S')) {
                parsedGear.data.damageType = 'stun';
            } else if (chummerGear.weaponbonusdamage.includes('M')) {
                parsedGear.data.damageType = 'matrix';
            }
            else {
                parsedGear.data.damageType = 'physical';
            }
        }

        return parsedGear;
    }
}