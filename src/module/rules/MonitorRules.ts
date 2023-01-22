/**
 * Everything calculating damage monitors, tracks and how damage applies to it.
 */
export const MonitorRules = {
    /**
     * Calculate the amount of damage boxes per wound modifier
     * 
     * According to SR5#169-170 'Wound Modifiers' and SR5#82 'Low Pain Tolerance'.
     * 
     * To avoid confusion between Low Pain and High Pain Tolerance, this method uses a
     * damage tolerance concept, allowing users to define how many boxes should determine
     * a wound modifier. This allows to define both lower and higher amounts of damage taken
     * per wound modifier.
     * 
     * @param damageTolerance Apply this damage tolerance to the base damage
     * @param baseDamage The amount of damage boxes taken before applying a wound modifier.
     */
    woundModifierBoxesThreshold(damageTolerance: number=0, baseDamage: number=3): number {
        return baseDamage + damageTolerance;
    },

    /**
     * Calculate the wounds for damage taken on a monitor.
     * 
     * This differes from wound modifier and will be positive value.
     * 
     * This is intended for stund an physical monitors and implements rules 
     * - SR5#169 'Wound Modifiers
     * - SR#74 'High Pain Tolerance'
     * 
     * @param damageTaken Amount of damage boxes filled on the damage monitor
     * @param woundBoxesThreshold Amount of damage boxes per wound modifier
     * @param painTolerance Amount of damage boxes that can be ingored before calculating wound modifiers. 
     *                      Expects a positive number when applying High Pain Tolerance Ratings
     * @returns The amount of wounds on a damage monitor.
     */
    wounds(damageTaken: number, woundBoxesThreshold: number, painTolerance: number=0): number {
        const relevantDamageTaken = Math.max(damageTaken - painTolerance, 0);
        return Math.floor(relevantDamageTaken / woundBoxesThreshold);
    },

    /**
     * Calculate the wound modifier based on the wounds taken.
     * 
     * @param wounds Amount of wounds (not damage) taken
     * @param modifierPerWound base modifier to apply to given wounds
     */
    woundModifier(wounds:number, modifierPerWound: number=-1): number {
        return wounds * modifierPerWound;
    }
}