import { SR5 } from '../../../config';

export class Constants {
    public static readonly MAP_CATEGORY_TO_SKILL = {
        'Assault Cannons': 'heavy_weapons',
        'Assault Rifles': 'automatics',
        'Blades': 'blades',
        'Bows': 'archery',
        'Carbines': 'automatics',
        'Clubs': 'clubs',
        'Crossbows': 'archery',
        'Exotic Melee Weapons': 'exotic_melee',
        'Exotic Ranged Weapons': 'exotic_ranged',
        'Flamethrowers': 'exotic_ranged',
        'Grenade Launchers': 'heavy_weapons',
        'Heavy Machine Guns': 'heavy_weapons',
        'Heavy Pistols': 'pistols',
        'Holdouts': 'pistols',
        'Laser Weapons': 'exotic_ranged',
        'Light Machine Guns': 'heavy_weapons',
        'Light Pistols': 'pistols',
        'Machine Pistols': 'automatics',
        'Medium Machine Guns': 'automatics',
        'Missile Launchers': 'heavy_weapons',
        'Shotguns': 'longarms',
        'Sniper Rifles': 'longarms',
        'Sporting Rifles': 'longarms',
        'Submachine Guns': 'automatics',
        'Tasers': 'pistols',
        'Unarmed': 'unarmed_combat',
    } as const;

    public static readonly MAP_IMPORT_RANGE_CATEGORY_TO_SYSTEM_RANGE_CATEGORY: {
        [key: string]: Exclude<keyof typeof SR5.weaponRangeCategories, "manual">;
    } = {
        'Tasers': 'taser',
        'Holdouts': 'holdOutPistol',
        'Light Pistols': 'lightPistol',
        'Heavy Pistols': 'heavyPistol',
        'Machine Pistols': 'machinePistol',
        'Submachine Guns': 'smg',
        'Assault Rifles': 'assaultRifle',
        'Shotguns': 'shotgunSlug',
        'Shotguns (slug)': 'shotgunSlug',
        'Shotguns (flechette)': 'shotgunFlechette',
        'Sniper Rifles': 'sniperRifle',
        'Sporting Rifles': 'sportingRifle',
        'Light Machine Guns': 'lightMachinegun',
        'Medium/Heavy Machinegun': 'mediumHeavyMachinegun',
        'Assault Cannons': 'assaultCannon',
        'Grenade Launchers': 'grenadeLauncher',
        'Missile Launchers': 'missileLauncher',
        'Bows': 'bow',
        'Light Crossbows': 'lightCrossbow',
        'Medium Crossbows': 'mediumCrossbow',
        'Heavy Crossbows': 'heavyCrossbow',
        'Thrown Knife': 'thrownKnife',
        'Net': 'net',
        'Shuriken': 'shuriken',
        'Standard Grenade': 'standardThrownGrenade',
        'Aerodynamic Grenade': 'aerodynamicThrownGrenade',
        'Harpoon Gun': 'harpoonGun',
        'Harpoon Gun (Underwater)': 'harpoonGunUnderwater',
        'Flamethrowers': 'flamethrower',
    } as const;

    public static readonly MAP_COMPENDIUM_KEY = {
        'Actor': {pack: 'world.actor', type: 'Actor'},
        'Item': {pack: 'world.item', type: 'Item'},
    } as const;

    public static readonly MAP_CHUMMER_PROGRAMM_CATEGORY = {
        'Hacking Programs': 'hacking_program',
        'Common Programs': 'common_program'
    } as const;
}
