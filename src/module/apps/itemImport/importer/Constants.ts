import { SR5 } from '../../../config';

export type CompendiumKey = keyof typeof Constants.MAP_COMPENDIUM_KEY;
export type ChummerFile =
    'actions' | 'armor' | 'bioware' | 'books' | 'complexforms' | 'contacts' | 'critterpowers' |
    'critters' | 'cyberware' | 'drugcomponents' | 'echoes' | 'gear' | 'improvements' | 'licenses' |
    'lifemodules' | 'lifestyles' | 'martialarts' | 'mentors' | 'metamagic' | 'metatypes' |
    'options' | 'packs' | 'paragons' | 'powers' | 'priorities' | 'programs' | 'qualities' | 'ranges' |
    'references' | 'settings' | 'sheets' | 'skills' | 'spells' | 'spiritpowers' | 'streams' |
    'strings' | 'tips' | 'traditions' | 'vehicles' | 'vessels' | 'weapons' | '_selectedsetting';

export type ChummerFileXML = `${ChummerFile}.xml`;

type CompendiumConfig = {
    pack: string;
    type: 'Actor' | 'Item';
    folder: string | null;
    subFolder: string | null;
};

export class Constants {
    public static readonly MAP_COMPENDIUM_CONFIG = {
        // Actors
        'Critter':          { pack: 'sr5critter',         type: 'Actor', folder: null, subFolder: null }, // Critters, Spirits and Sprites
        'Drone':            { pack: 'sr5drone',           type: 'Actor', folder: null, subFolder: null }, // Vehicles and Drones

        // Items
        'Gear':             { pack: 'sr5gear',            type: 'Item', folder: null, subFolder: null }, // Armor + General Gear
        'Trait':            { pack: 'sr5trait',           type: 'Item', folder: null, subFolder: null }, // Quality + Powers
        'Magic':            { pack: 'sr5magic',           type: 'Item', folder: null, subFolder: null }, // Spells, rituals, complex forms
        'Modification':     { pack: 'sr5modification',    type: 'Item', folder: null, subFolder: null }, // Armor/Vehicle/weapon mods + ammo
        'Ware':             { pack: 'sr5ware',            type: 'Item', folder: null, subFolder: null }, // Bioware + Cyberware
        'Weapon':           { pack: 'sr5weapon',          type: 'Item', folder: null, subFolder: null }, // Weapons

        // Miscs
        'Misc':             { pack: 'sr5misc',            type: 'Item', folder: null, subFolder: null }, // Actions
    } as const satisfies Record<string, CompendiumConfig>;

    public static readonly MAP_COMPENDIUM_KEY = {
        // --- Critters ---
        Critter:        this.MAP_COMPENDIUM_CONFIG.Critter,
        Spirit:         this.MAP_COMPENDIUM_CONFIG.Critter,
        Sprite:         this.MAP_COMPENDIUM_CONFIG.Critter,
        Critter_Power:  this.MAP_COMPENDIUM_CONFIG.Trait,

        // --- Character Traits ---
        Quality:        this.MAP_COMPENDIUM_CONFIG.Trait,
        Ware:           this.MAP_COMPENDIUM_CONFIG.Ware,

        // --- Vehicles ---
        Drone:          this.MAP_COMPENDIUM_CONFIG.Drone,
        Vehicle:        this.MAP_COMPENDIUM_CONFIG.Drone,
        Vehicle_Mod:    this.MAP_COMPENDIUM_CONFIG.Modification,

        // --- Magic ---
        Adept_Power:    this.MAP_COMPENDIUM_CONFIG.Trait,
        Complex_Form:   this.MAP_COMPENDIUM_CONFIG.Magic,
        Echo:           this.MAP_COMPENDIUM_CONFIG.Trait,
        Spell:          this.MAP_COMPENDIUM_CONFIG.Magic,

        // --- Gear ---
        Ammo:           this.MAP_COMPENDIUM_CONFIG.Gear,
        Armor:          this.MAP_COMPENDIUM_CONFIG.Gear,
        Device:         this.MAP_COMPENDIUM_CONFIG.Gear,
        Program:        this.MAP_COMPENDIUM_CONFIG.Gear,
        Gear:           this.MAP_COMPENDIUM_CONFIG.Gear,
        Weapon:         this.MAP_COMPENDIUM_CONFIG.Weapon,
        Weapon_Mod:     this.MAP_COMPENDIUM_CONFIG.Modification,

        // Misc
        Action:         this.MAP_COMPENDIUM_CONFIG.Misc
    } as const satisfies Record<string, CompendiumConfig>;

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

    public static readonly MAP_IMPORT_RANGE_CATEGORY_TO_SYSTEM_RANGE_CATEGORY = {
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
    } as const satisfies Record<string, Exclude<keyof typeof SR5.weaponRangeCategories, "manual">> ;

    public static readonly attributeTable = {
        "BOD": "body", "AGI": "agility", "REA": "reaction",
        "STR": "strength", "WIL": "willpower","LOG": "logic",
        "INT": "intuition", "CHA": "charisma", "EDG": "edge",
        "MAG": "magic", "RES": "ressonance", "ESS": "essence"
    } as const;
}
