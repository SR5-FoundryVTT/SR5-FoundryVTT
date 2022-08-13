import {Helpers} from "../helpers";

export const RangedRules = {
    /**
     * Give a defense modifier according to rounds consumed and SR5#180.
     *
     * If given and not enough ammunition is available reduced defense modifier rules
     * will be applied.
     *
     * @param rounds How many rounds should be fired
     * @param ammo How many rounds can be fired
     *
     * @returns a negative defense modifier value
     */
    fireModeDefenseModifier: function(rounds: number, ammo: number=0): number {
        // For negative rounds use a sane default.
        rounds = rounds < 0 ? rounds * -1 : rounds;

        let modifier = Helpers.mapRoundsToDefenseMod(rounds);
        // No modifier can't be further reduced by missing ammunition.
        if (modifier === 0) return 0;

        if (ammo <= 0) ammo = rounds;
        if (ammo >= rounds) return modifier;

        // Reduce negative modifier by one for each missing unit.
        return Math.min(modifier + rounds - ammo, 0);
    },

    /**
     * Calculate the recoil attack modifier according to SR5#175
     *
     * NOTE: Reducing recoil compensation here is a bit unintuitive and might be easier to read
     *       with its own rule function.
     *
     * @param compensation Remaining recoil compensation
     * @param rounds Amount of rounds to be fired
     * @param ammo Amount of ammunition available
     *
     * @return compensation Amount of compensation left.
     * @return recoilModifier Attack modifier to be applied on the attack.
     */
    recoilAttackModifier: function(compensation: number, rounds: number, ammo: number = 0): { compensation: number, recoilModifier: number } {
        if (ammo <= 0) ammo = rounds;

        // Only fire amount of rounds available.
        rounds = Math.min(rounds, ammo);
        // Derive recoil modifier from difference.
        const recoilModifier = Math.min(compensation - rounds, 0);
        // Reduce compensation for additional attacks this combat turn.
        compensation = Math.max(compensation - rounds, 0);

        return {compensation, recoilModifier};
    }
}