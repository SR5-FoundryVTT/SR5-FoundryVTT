import { SR5 } from '../config';
import { DefaultValues } from './../data/DataDefaults';
import LimitField = Shadowrun.LimitField;


export const LimitRules = {
    /**
     * Derive the astral limit of a character from it's other limits based on SR5#278.
     * 
     * NOTE: Modify the original astral limit to keep pre-applied modifiers like ActiveEffects.
     * 
     * @param astral The current astral fields with all it's modifiers, this is to be modified.
     * @param mental The characters mental limit.
     * @param social The characters social limit.
     * 
     * @returns The astral limit as a modified source value.
     */
    calculateAstralLimit(astral: LimitField, mental: LimitField, social: LimitField): LimitField {
        astral.base = Math.max(mental.value, social.value);

        return astral;
    }
}