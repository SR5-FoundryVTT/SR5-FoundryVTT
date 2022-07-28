/**
 * Shadowrun 5 related rules to threading complex forms.
 */
export const ComplexFormRules = {
    /**
     * As defined in SR5#251-252 section Fading.
     */
    minimalFade: 2,
    /**
     * Based on the minimal level value use this as the minimal usable level value.
     * @param fadeModifier The fade modifier defined within the complex forms action configuration.
     */
    calculateMinimalLevel: function(fadeModifier: number): number {
        return Math.max(1, this.minimalFade - fadeModifier);
    },

    calculateLevel: function(level: number): number {
        return Math.max(1, level);
    },

    /**
     * The threading test limit as defined in SR5#250 Thread Complex Form action.
     * @param level
     */
    calculateLimit: function(level: number): number {
        return level;
    },

    /**
     * Calculate fade for complex forms based on SR5#250
     *
     * @param level The level chosen to thread this complex form.
     * @param fadeModifier The action modifier for fade damage.
     */
    calculateFade: function(level: number, fadeModifier: number): number {
        const fade = level + fadeModifier;
        return Math.max(this.minimalFade, fade);
    }
}