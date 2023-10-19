import { DataDefaults } from "../data/DataDefaults";
import { Helpers } from "../helpers";
import { DrainRules } from "./DrainRules";

/**
 * Rules implementing the ritual chapter in SR5.295f
 */
export const RitualRules = {

    /**
     * Determine the amount of hits
     * 
     * @param hitsCaster Hits of the ritual test.
     * @param hitsRitual Hits of the ritual opposing test.
     */
        ritualHits: (hitsCaster: number, hitsRitual: number): number => {
            return Math.max(hitsCaster - hitsRitual, 0);
        },

    /**
     * Determine the amount of drain value all ritual participants have to drain against.
     * 
     * See SR5#296 'Seal the ritual'
     * 
     * @param hits The amount of hits of the opposing ritual
     */
    drainValue: (hits: number, reagents: number, force: number): number => {
        let reduction = Math.max((reagents/force)-1, 0);
        return Math.max(hits * 2 - reduction, 2);
    },

    /**
     * Determine the drain damage a ritual participant has to drain against.
     * 
     * See SR5#296 and general Drain Rules.
     * 
     * @param hits The amount of hits of the opposing ritual
     * @param force The force level chosen for the ritual
     * @param magic The magic attribute level of the ritual leader
     */
    calcDrainDamage: (hits, drain: number, magic: number): Shadowrun.DamageData => {
        if (hits < 0) hits = 0;
        if (magic < 0) magic = 1;

        console.log(hits)

        const damage = DataDefaults.damageData();
        damage.base = drain;
        damage.type.base = damage.type.value = DrainRules.calcDrainDamageType(hits, magic);
        Helpers.calcTotal(damage, {min: 0});
        
        return damage;
    },

    /**
     * Determine if the chosen force is valid for the given lodge rating.
     * 
     * See SR5#300 'Ritual Spellcasting' Step 4.
     * 
     * @param force The force value.
     * @param lodgeRating The lodge rating value.
     */
    validForce: (force: number, lodgeRating: number): boolean => {
        if (force < 1) {
            return false;
        }

        return force <= lodgeRating;
    },

    validReagent: (reagents: number, force: number): boolean => {
        if (force < 1) {
            return false;
        }

        return force <= reagents;
    }
}