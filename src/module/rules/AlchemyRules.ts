import { SR5 } from "../config";

/**
 * Shadowrun 5 rules around Alchemy and alchemical preparations.
 *
 * Main rules: SR5#304-306 'Alchemy'. Street Grimoire#209-210 clarifies activation.
 *
 * NOTE: Metamagics and qualities that alter these numbers (Fixation, Durable Preparations,
 * Advanced Alchemy triggers, Blood Alchemy) are not implemented. The seams for them are the
 * decayInterval and fullPotencyMultiplier getters below.
 */
export const AlchemyRules = {
    /**
     * Seconds between potency losses once decay has started.
     *
     * As defined in SR5#305 'The Finished Preparation'.
     */
    get decayInterval(): number {
        return 3600;
    },

    /**
     * How many hours per point of potency the preparation holds full strength.
     *
     * As defined in SR5#305 'The Finished Preparation'.
     */
    get fullPotencyMultiplier(): number {
        return 2;
    },

    /**
     * The highest force a preparation can be created at.
     *
     * As defined in SR5#304 'Step 2: Choose Spell Force'.
     */
    maxForce: (magic: number): number => magic * 2,

    /**
     * Don't abort on an invalid force, only inform the user. Consistent with ritual casting.
     */
    validForce: (force: number, magic: number): boolean => {
        return force > 0 && force <= AlchemyRules.maxForce(magic);
    },

    /**
     * Additional drain applied by the chosen trigger.
     *
     * As defined in SR5#305 'Step 4: Choose Preparation Trigger'.
     */
    triggerDrainModifier: (trigger: string): number => {
        return SR5.preparationTriggerDrain[trigger] ?? 0;
    },

    /**
     * Drain value for creating a preparation: the spell's drain plus the trigger's modifier.
     *
     * The minimum drain of 2 from SR5#282 applies here as well.
     *
     * As defined in SR5#305 'Step 6: Resist Drain'.
     */
    drainValue: (force: number, spellDrain: number, trigger: string): number => {
        const drain = force + spellDrain + AlchemyRules.triggerDrainModifier(trigger);
        return Math.max(2, drain);
    },

    /**
     * Uninterrupted minutes of crafting needed before the creation test is rolled.
     *
     * As defined in SR5#305 'Step 5: Create the Preparation'.
     */
    craftingMinutes: (force: number): number => force,

    /**
     * A time trigger may not be set further out than the preparation's potency in hours.
     *
     * As defined in SR5#305 'Step 4: Choose Preparation Trigger'.
     *
     * @param seconds The countdown chosen by the user.
     * @param potency The potency the preparation ended up with.
     */
    validTriggerTime: (seconds: number, potency: number): boolean => {
        return seconds <= potency * 3600;
    },

    /**
     * Seconds a preparation holds its full potency before decay starts.
     *
     * As defined in SR5#305 'The Finished Preparation'.
     */
    fullPotencyDuration: (potency: number): number => {
        return potency * AlchemyRules.fullPotencyMultiplier * AlchemyRules.decayInterval;
    },

    /**
     * The world time at which a preparation reaches potency 0 and goes inert.
     *
     * Full strength for (potency x 2) hours, then -1 per hour, so (potency x 3) hours in total.
     */
    expiresAt: (basePotency: number, createdWorldTime: number): number => {
        if (basePotency <= 0) return createdWorldTime;
        return createdWorldTime + AlchemyRules.fullPotencyDuration(basePotency) + basePotency * AlchemyRules.decayInterval;
    },

    /**
     * Current potency of a preparation, derived rather than stored so it can't drift out of sync
     * with the world clock and stays correct when the GM rewinds time.
     *
     * As defined in SR5#305 'The Finished Preparation'.
     *
     * @param basePotency The potency the preparation was created with.
     * @param createdWorldTime The world time the preparation was created at.
     * @param worldTime The world time to evaluate the potency for.
     */
    currentPotency: (basePotency: number, createdWorldTime: number, worldTime: number): number => {
        if (basePotency <= 0) return 0;

        const elapsed = Math.max(0, worldTime - createdWorldTime);
        const fullDuration = AlchemyRules.fullPotencyDuration(basePotency);
        if (elapsed <= fullDuration) return basePotency;

        // The first point is lost one full interval after the full strength window ends, which
        // puts potency 0 exactly at expiresAt.
        const decayed = Math.floor((elapsed - fullDuration) / AlchemyRules.decayInterval);
        return Math.max(0, basePotency - decayed);
    },

    /**
     * The dice pool used when a preparation is triggered: the preparation rolls for itself, using
     * its force in place of Magic and its potency in place of the Spellcasting skill.
     *
     * As defined in SR5#305-306 'Using a Preparation' and SG#210.
     */
    activationPool: (force: number, potency: number): number => {
        return Math.max(0, force) + Math.max(0, potency);
    },

    /**
     * Minutes a sustained spell released from a preparation lasts.
     *
     * As defined in SR5#306 'Using a Preparation'.
     */
    sustainedMinutes: (potency: number): number => potency,
};
