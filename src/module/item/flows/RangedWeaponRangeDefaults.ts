export const RANGED_WEAPON_TYPES = [
    "Taser",
    "Hold-Out Pistol",
    "Light Pistol",
    "Heavy Pistol",
    "Machine Pistol",
    "SMG",
    "Assault Rifle",
    "Shotgun (flechette)",
    "Shotgun (slug)",
    "Sniper Rifle",
    "Light Machinegun",
    "Medium/Heavy Machinegun",
    "Assault Cannon",
    "Grenade Launcher",
    "Missile Launcher",
    // "Bow", Bows use Strength to determine range
    "Light Crossbow",
    "Medium Crossbow",
    "Heavy Crossbow",
    // "Thrown Knife", All thrown weapons use Strength to determine range
    // "Shuriken",
    // "Standard Thrown Grenade",
    // "Aerodynamic Thrown Grenade";
] as const;

export type RangedWeaponType = typeof RANGED_WEAPON_TYPES[number];
export type RangedWeaponTypeInput = RangedWeaponType | "Custom";

export type RangedWeaponRanges = {
    // [Short, Medium, Long, Extreme]
    [T in RangedWeaponType]: [number, number, number, number];
}

export const RANGED_WEAPON_RANGES: RangedWeaponRanges = {
    "Taser": [5, 10, 15, 20],
    "Hold-Out Pistol": [5, 15, 30, 50],
    "Light Pistol": [5, 15, 30, 50],
    "Heavy Pistol": [5, 20, 40, 60],
    "Machine Pistol": [5, 15, 30, 50],
    "SMG": [10, 40, 80, 150],
    "Assault Rifle": [25, 150, 350, 550],
    "Shotgun (flechette)": [15, 30, 45, 60],
    "Shotgun (slug)": [10, 40, 80, 150],
    "Sniper Rifle": [50, 350, 800, 1500],
    "Light Machinegun": [25, 200, 400, 800],
    "Medium/Heavy Machinegun": [40, 250, 750, 1200],
    "Assault Cannon": [50, 300, 750, 1500],
    "Grenade Launcher": [50, 100, 150, 500],
    "Missile Launcher": [70, 150, 450, 1500],
    "Light Crossbow": [6, 24, 60, 120],
    "Medium Crossbow": [9, 36, 90, 150],
    "Heavy Crossbow": [15, 45, 120, 180],
}