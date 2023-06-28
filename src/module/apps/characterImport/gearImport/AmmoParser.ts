import { BaseGearParser } from "./BaseGearParser"
import { iconAssign } from '../../iconAssigner/iconAssign';

/**
 * Parses ammunition
 */
export class AmmoParser extends BaseGearParser {
   
    override parse(chummerGear : any) : any {
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
        
        parsedGear.img = iconAssign(parsedGear.type, parsedGear.name, parsedGear.system);

        return parsedGear;
    }
}