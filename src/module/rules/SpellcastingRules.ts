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
     * @param reckless Set this to true should the spell be cast recklessly as defined in SR5#281 Cast Spell.
     */
    static calculateDrain(force: number, drainModifier: number, reckless: boolean = false): number {
        const recklessModifier = reckless ? this.recklessDrainModifier : 0;
        const drain = force + drainModifier + recklessModifier;
        return Math.max(this.minimalDrain, drain);
    }

    /**
     * As defined in SR5#282 - Step 6 Resist Drain
     */
    static get minimalDrain(): number {
        return 2;
    }

    /**
     * As defined in SR5#281 - Step 4 Cast Spell.
     *
     * Reckless spellcasting will alter drain damage.
     */
    static get recklessDrainModifier(): number {
        return 3;
    }

    /**
     * Based on the minimal drain value use this as the minimal usable force value.
     * @param drainModifier The drain modifier defined within the spells action configuration.
     */
    static calculateMinimalForce(drainModifier: number): number {
        return Math.max(1, this.minimalDrain - drainModifier);
    }

    /**
     * Calculate spell casting limit based on the force chosen.
     *
     * As defined in SR5#281 - Step 3 Choose Spell Force
     *
     * @param force The spell force chosen by test configuration.
     * @returns The limit value to be applied.
     */
    static calculateLimit(force: number): number {
        return force;
    }
}