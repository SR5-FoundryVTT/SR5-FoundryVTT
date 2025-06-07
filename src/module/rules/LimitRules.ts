import { SR5 } from '../config';
import { DataDefaults } from './../data/DataDefaults';
import { LimitFieldType } from '../types/template/LimitsModel';
import { AttributeFieldType } from '../types/template/AttributesModel';


/**
 * Rules around caluclating and anything to do with limits.
 */
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
    calculateAstralLimit(astral: LimitFieldType, mental: LimitFieldType, social: LimitFieldType): LimitFieldType {
        astral.base = Math.max(mental.value, social.value);
        astral.label = SR5.limits.astral;

        return astral;
    },

    /**
     * Derive the magic limit of character from it's magic attribute.
     * 
     * There is no rule for that, but when using an attribute as a limit, we should honor 
     * the general limit interface.
     * 
     * @params magic The magic attribute to use.
     * @returns A magic limit field based on the magic attribute
     */
    calculateMagicLimit(magic: AttributeFieldType): LimitFieldType {
        return DataDefaults.createData('limit_field', {
            base: magic.value,
            label: magic.label
        });
    },

    /**
     * Derive the initiation limit of a character from its initiation rank.
     * @param initiation The rank of initiation.
     * @returns A hidden limit as to not show it on the sheet limits.
     */
    calculateInitiationSubmersionLimit(initiation: number): LimitFieldType {
        return DataDefaults.createData('limit_field', {
            base: initiation,
            value: initiation,
            label: SR5.limits.initiation,
            hidden: true
        })
    }
}