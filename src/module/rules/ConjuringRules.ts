import { DataDefaults } from "../data/DataDefaults";
import { Helpers } from "../helpers";
import { DamageType } from "../types/item/Action";
import { DrainRules } from "./DrainRules";

/**
 * Rules implementing the Conjuring chapter in SR5.300
 */
export const ConjuringRules = {
    /**
     * Determine the amount of services a spirit will provide the it's summoner
     * 
     * @param hitsSummoner Hits of the summoning test.
     * @param hitsSpirit Hits of the spirits opposing test.
     */
    spiritServices: (hitsSummoner: number, hitsSpirit: number): number => {
        return Math.max(hitsSummoner - hitsSpirit, 0);
    },

    /**
     * Determine the amount of drain value a summoner has to drain against.
     * 
     * See SR5#300 'Resist Drain'
     * 
     * @param hitsSpirit The amount of hits of the opposing spirit
     */
    summoningDrainValue: (hitsSpirit: number): number => {
        return Math.max(hitsSpirit * 2, 2);
    },

    /**
     * Determine the drain damage a summoner has to drain against.
     * 
     * See SR5#300 and general Drain Rules.
     * 
     * @param hitsSpirit The amount of hits of the opposing spirit
     * @param force The force level chosen for summoning
     * @param magic The magic attribute level of the summoner
     */
    calcDrainDamage: (hitsSpirit, force: number, magic: number): DamageType => {
        if (hitsSpirit < 0) hitsSpirit = 0;
        if (magic < 0) magic = 1;

        const damage = DataDefaults.createData('damage');
        damage.base = ConjuringRules.summoningDrainValue(hitsSpirit);
        damage.type.base = damage.type.value = DrainRules.calcDrainDamageType(force, magic);
        Helpers.calcTotal(damage, {min: 0});
        
        return damage;
    },

    /**
     * Determine if the chosen force is valid for the given magic attribute.
     * 
     * See SR5#300 'Summoning' Step 1.
     * 
     * @param force The force value.
     * @param magic The magic attribute value.
     */
    validForce: (force: number, magic: number): boolean => {
        if (force < 1) return false;
        return force <= magic * 2;
    }
}