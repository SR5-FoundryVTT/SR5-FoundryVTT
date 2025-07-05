import { DataDefaults } from "../data/DataDefaults";
import { Helpers } from "../helpers";
import { DrainRules } from "./DrainRules";

/**
 * Rules implementing the Alchemy chapter in SR5.304
 */
export const AlchemicalSpellCastingRules = {
    /**
     * Determine the amount of services a spirit will provide the it's summoner
     * 
     * @param hitsAlchemist Hits of the alchemist test.
     * @param hitsPreperation Hits of the preperation opposing test.
     */
    potency: (hitsAlchemist: number, hitsPreperation: number): number => {
        return Math.max(hitsAlchemist - hitsPreperation, 0);
    },

    /**
     * Determine if the chosen force is valid for the given magic attribute.
     * 
     * See SR5#304 'Alchemy' Step 2.
     * 
     * @param force The force value.
     * @param magic The magic attribute value.
     */
    validForce: (force: number, magic: number): boolean => {
        if (force < 1) return false;
        return force <= magic * 2;
    }
}