import * as config from '../../config';

type WeaponTypes = Exclude<keyof typeof config.SR5.rangedWeaponTypes, "manual">;

type RangedWeaponRanges = {
    // [Short, Medium, Long, Extreme]
    [key in WeaponTypes]: [number, number, number, number];
}

export const RANGED_WEAPON_RANGES: RangedWeaponRanges = {
    "taser": [5, 10, 15, 20],
    "holdOutPistol": [5, 15, 30, 50],
    "lightPistol": [5, 15, 30, 50],
    "heavyPistol": [5, 20, 40, 60],
    "machinePistol": [5, 15, 30, 50],
    "smg": [10, 40, 80, 150],
    "assaultRifle": [25, 150, 350, 550],
    "shotgunFlechette": [15, 30, 45, 60],
    "shotgunSlug": [10, 40, 80, 150],
    "sniperRifle": [50, 350, 800, 1500],
    "lightMachinegun": [25, 200, 400, 800],
    "mediumHeavyMachinegun": [40, 250, 750, 1200],
    "assaultCannon": [50, 300, 750, 1500],
    "grenadeLauncher": [50, 100, 150, 500],
    "missileLauncher": [70, 150, 450, 1500],
    "lightCrossbow": [6, 24, 60, 120],
    "mediumCrossbow": [9, 36, 90, 150],
    "heavyCrossbow": [15, 45, 120, 180],
}