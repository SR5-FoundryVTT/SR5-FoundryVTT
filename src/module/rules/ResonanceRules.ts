import { DamageType } from "../types/item/Action";

/**
 * All rules related to Technomancers and Resonance.
 * 
 */
export const ResonsanceRules = {
    /**
     * Living persona take matrix damage as stun.
     * 
     * See SR5#251 'Living Persona'
     * @param damage The matrix damage to convert;
     * @returns Stun or original damage, depending on type.
     */
    convertMatrixDamage(damage: DamageType): DamageType {
        if (damage.type.value !== 'matrix') return damage;
        // Avoid mutating the original damage object
        return {...damage, type: {base: 'stun', value: 'stun'}};
    }
};
