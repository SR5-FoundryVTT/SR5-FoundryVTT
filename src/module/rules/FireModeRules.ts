import { SR5 } from "../config";
import { FiringModeType } from "../types/item/Weapon";
import { FireModeType } from "../types/flags/ItemFlags";


export const FireModeRules = {
    /**
     * Give a defense modifier according to rounds consumed and SR5#180.
     *
     * If given and not enough ammunition is available reduced defense modifier rules
     * will be applied.
     *
     * @param fireMode The selected fireMode 
     * @param ammoLeft How many rounds can be fired
     *
     * @returns a negative defense modifier value
     */
    fireModeDefenseModifier: function(fireMode: FireModeType, ammoLeft: number=0): number {
        // For negative rounds use a sane default.
        const rounds = fireMode.value < 0 ? fireMode.value * -1 : fireMode.value;
        // Due to legecy value, sometimes a string numerical sneaks in...
        const modifier = Number(fireMode.defense);
        // Zero modifier can't be further reduced by missing ammunition.
        if (modifier === 0) return 0;

        // Reduce modifier by avaiable ammunition.
        if (ammoLeft <= 0) ammoLeft = rounds;
        if (ammoLeft >= rounds) return modifier;

        // Reduce negative modifier by one for each missing unit.
        return Math.min(modifier + rounds - ammoLeft, 0);
    },

    /**
     * Calculate the recoil attack modifier according to SR5#175
     *
     * NOTE: Reducing recoil compensation here is a bit unintuitive and might be easier to read
     *       with its own rule function.
     *
     * @param fireMode The chosen fire mode for the attack
     * @param compensation Actors recoil compensation
     * @param recoil Accured progressive recoil of the actor before current attack
     * @param ammoLeft Amount of ammunition available
     *
     * @return compensation Amount of compensation left.
     * @return new recoil modifier.
     */
    recoilModifierAfterAttack: function(fireMode: FireModeType, compensation: number, recoil: number=0, ammoLeft: number = 0): number {
        // Sanitze negative fire mode values by pretending not to shoot.
        if (fireMode.value < 0) return 0;
        // Sanitaze negative ammo values by pretending to have just enough.
        if (ammoLeft <= 0) ammoLeft = fireMode.value;
        // Only fire amount of rounds available.
        const additionalRecoil = FireModeRules.additionalRecoil(fireMode, ammoLeft);
        // Compensate recoil to get modifier.
        return FireModeRules.recoilModifier(compensation, recoil, additionalRecoil);
    },
    
    /**
     * Calculate the amount of additional recoil possible depending on recoil of the firemode and
     * ammunition left.
     * 
     * @param fireMode Choosen fire mode to attack with
     * @param ammoLeft Ammunition left in the weapon
     * @returns A positive number or zero, if no additional recoil will be caused.
     */
    additionalRecoil: function(fireMode: FireModeType, ammoLeft: number): number {
        return fireMode.recoil ? Math.min(fireMode.value, ammoLeft) : 0;
    },

    /**
     * Calculate the revoil modifier value according to SR5#175 'Recoil' and 'Progressive Recoil'
     * 
     * @param compensation Amount of total recoil compensation available.
     * @param recoil Current Amount of total progressive recoil.
     * @param additionalRecoil Amount of additional fired ammunition.
     * 
     * @returns a negative number or zero.
     */
    recoilModifier: function(compensation: number, recoil: number, additionalRecoil: number=0) {
        return Math.min(compensation - (recoil + additionalRecoil), 0);
    },

    /**
     * Determine what firemodes are available to a ranged weapon user.
     * 
     * @param rangedWeaponModes The weapon modes on the actual gun 
     * @param ammoLeft The amount of rounds left. If not given, all firemodes will returned.
     * 
     * @returns A list of firemodes sorted by weapon mode and rounds necessary.
     */
    availableFireModes: function (rangedWeaponModes: FiringModeType, ammoLeft?: number): FireModeType[] {
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