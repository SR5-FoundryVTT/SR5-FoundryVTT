
export const TestRules = {

    /**
     * The modifier value applied for each extended test iteration
     */
    extendedModifierValue: -1,

    /**
     * Calculate the modifier for the next extended test run.
     *
     * @param current The current extended test modifier or zero.
     */
    calcNextExtendedModifier: (current: number = 0): number => {
        return current + TestRules.extendedModifierValue;
    },

    /**
     * Can a test be extended using the given pool value
     * @param pool The pool of the test to be extended.
     * @param threshold The extended test threshold to be met
     * @param extendedHits The summed up hits across all test iterations
     * @returns When true, test can be extended.
     */
    canExtendTest: (pool: number, threshold: number, extendedHits: number): boolean => {
        // An extended test without a threshold set can extend until no pool is left.
        if (threshold > 0)
            return extendedHits < threshold && pool > 0;

        return pool > 0;
    },

    /**
     * Has a Success Test been successful?
     * @param hits
     * @param threshold
     */
    success:(hits, threshold): boolean => {
        // Don't allow any negative values.
        hits = Math.max(hits, 0);
        threshold = Math.max(threshold, 0);

        // Either check against meeting the threshold or simply any hits.
        if (threshold > 0) return hits >= threshold;
        else return hits > 0;
    },

    /**
     * Has a Success Test glitched?
     *
     * @param glitches The amount of dice with glitch value
     * @param pool The amount of dice used for the test as a whole
     * @returns If true, the given success test values result in a glitched test
     */
    glitched: (glitches: number, pool: number): boolean => {
        // Don't allow any negative values.
        glitches = Math.max(glitches, 0);
        pool = Math.max(pool, 1);

        return glitches > Math.floor(pool / 2);
    },

    /**
     * Has a Success Test glitched critically?
     *
     * @param success Has a test been a success?
     * @param glitched Has a test been glitched?
     */
    criticalGlitched: (success: boolean, glitched: boolean): boolean => {
        return !success && glitched;
    }
}