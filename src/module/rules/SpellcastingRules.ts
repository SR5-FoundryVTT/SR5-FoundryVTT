/**
 * Shadowrun 5 rules related to magic / spellcasting.
 */
export class SpellcastingRules {
    /**
     * Calculate spellcasting drain value without its damage type
     *
     * As defined in SR5#282 - Step 6 Resist Drain.
     *
     * @param force The force the spell is cast with.
     * @param drainModifier The drain modifier defined within the spells action configuration.
     */
    static calculateDrain(force: number, drainModifier: number): number {
        const drain = force - drainModifier;
        return drain < this.minimalDrain ? this.minimalDrain : drain
    }

    /**
     * As defined in SR5#282 - Step 6 Resist Drain
     */
    static get minimalDrain(): number {
        return 2;
    }

    /**
     * Based on the minimal drain value use this as the minimal usable force value.
     * @param drainModifier The drain modifier defined within the spells action configuration.
     */
    static calculateMinimalForce(drainModifier: number): number {
        return Math.max(1, this.minimalDrain - drainModifier);
    }
}