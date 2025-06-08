import { SR5 } from '../../../config';

export class Constants {
    
    public static readonly MAP_COMPENDIUM_KEY = {
        // Actors
        'Critter':          { pack: 'world.sr5critter',         type: 'Actor' }, // Critters, Spirits and Sprites
        'Drone':            { pack: 'world.sr5drone',           type: 'Actor' }, // Vehicles and Drones

        // Items 
        'Gear':             { pack: 'world.sr5gear',            type: 'Item' }, // Armor + General Gear
        'Trait':            { pack: 'world.sr5trait',           type: 'Item' }, // Bioware + Cyberware + Quality + Powers
        'Magic':            { pack: 'world.sr5magic',           type: 'Item' }, // Spells, rituals, complex forms
        'Modification':     { pack: 'world.sr5modification',    type: 'Item' }, // Armor/Vehicle/weapon mods + ammo
        'Weapon':           { pack: 'world.sr5weapon',          type: 'Item' }, // Weapons
    } as const;

    public static readonly MAP_TRANSLATION_TYPE: Record<string, string> = {
        'adept_power': 'power',
        'ammo': 'gear',
        'armor': 'armor',
        'bioware': 'bioware',
        'complex_form': 'complexform',
        'critter_power': 'power',
        'cyberware': 'cyberware',
        'device': 'gear',
        'echo': 'echo',
        'equipment': 'gear',
        'modification': 'mod',
        'program': 'gear',
        'quality': 'quality',
        'spell': 'spell',
        'spirit': 'metatype',
        'sprite': 'metatype',
        'sprite_power': 'power',
        'vehicle': 'vehicle',
        'weapon': 'weapon'
    } as const;

    public static readonly MAP_CATEGORY_TO_SKILL = {
        'Assault Cannons': 'heavy_weapons',
        'Assault Rifles': 'automatics',
        'Blades': 'blades',
        'Bows': 'archery',
        'Carbines': 'automatics',
        'Clubs': 'clubs',
        'Crossbows': 'archery',
        'Exotic Melee Weapons': 'exotic_melee',
        'Exotic Ranged Weapons': 'exotic_range',
        'Flamethrowers': 'exotic_range',
        'Grenade Launchers': 'heavy_weapons',
        'Heavy Machine Guns': 'heavy_weapons',
        'Heavy Pistols': 'pistols',
        'Holdouts': 'pistols',
        'Laser Weapons': 'exotic_range',
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

    public static readonly MAP_IMPORT_RANGE_CATEGORY_TO_SYSTEM_RANGE_CATEGORY: 
        Record<string, Exclude<keyof typeof SR5.weaponRangeCategories, "manual">>
     = {
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
}
