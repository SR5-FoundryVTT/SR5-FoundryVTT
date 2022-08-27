import FireModeData = Shadowrun.FireModeData;
import FiringModeData = Shadowrun.FiringModeData;
import RangedWeaponMode = Shadowrun.RangedWeaponMode;
import { SR5 } from "../config";
import { Helpers } from "../helpers";

export const FireModeRules = {
    /**
     * Give a defense modifier according to rounds consumed and SR5#180.
     *
     * If given and not enough ammunition is available reduced defense modifier rules
     * will be applied.
     *
     * @param fireMode The selected fireMode 
     * @param ammo How many rounds can be fired
     *
     * @returns a negative defense modifier value
     */
    fireModeDefenseModifier: function(fireMode: FireModeData, ammo: number=0): number {
        // For negative rounds use a sane default.
        const rounds = fireMode.value < 0 ? fireMode.value * -1 : fireMode.value;
        // Due to legecy value, sometimes a string numerical sneaks in...
        const modifier = Number(fireMode.defense);
        // Zero modifier can't be further reduced by missing ammunition.
        if (modifier === 0) return 0;

        // Reduce modifier by avaiable ammunition.
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
     * @param fireMode The chosen fire mode
     * @param compensation Remaining recoil compensation
     * @param ammo Amount of ammunition available
     *
     * @return compensation Amount of compensation left.
     * @return recoilModifier Attack modifier to be applied on the attack.
     */
    recoilAttackModifier: function(fireMode: FireModeData, compensation: number, ammo: number = 0): { compensation: number, recoilModifier: number } {
        // Some firemodes don't cause recoil.
        if (!fireMode.recoil) return {compensation, recoilModifier: 0};
        // Sanitaze negative ammo values by pretending to have just enough.
        if (ammo <= 0) ammo = fireMode.value;

        // Only fire amount of rounds available.
        const rounds = Math.min(fireMode.value, ammo);
        // Compensate recoil to get modifier.
        const recoilModifier = Math.min(compensation - rounds, 0);
        // Reduce compensation for additional attacks this combat turn.
        compensation = Math.max(compensation - rounds, 0);

        return {compensation, recoilModifier};
    },

    /**
     * Available firemodes for a weapon
     * @param rangedWeaponModes The weapon modes on the actual gun 
     * @param rounds The amount of rounds left. If not given, all firemodes will returned.
     * 
     * @returns A list of firemodes sorted by weapon mode and rounds necessary.
     */
    availableFireModes: function (rangedWeaponModes: FiringModeData, rounds?: number): FireModeData[] {
        // Reduce all fire modes to what's available on weapon
        // TODO: rounds check
        return SR5.fireModes
            .filter(fireMode => rangedWeaponModes[fireMode.mode])
            .sort((modeA, modeB) => {
            // Same modes, ascending spent rounds.
            if (modeA.mode === modeB.mode) {
                // Numerical values can be substracted to 1 / -1 aprox.
                return modeA.value - modeB.value;
            }
            
            const modeAIndex = SR5.rangeWeaponMode.indexOf(modeA.mode);
            const modeBIndex = SR5.rangeWeaponMode.indexOf(modeB.mode);
            return modeAIndex > modeBIndex ? 1 : -1;
        });
    }
}