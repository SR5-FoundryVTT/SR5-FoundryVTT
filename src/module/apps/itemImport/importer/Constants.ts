import { SR5 } from '../../../config';

export type CompendiumKey = keyof typeof Constants.MAP_COMPENDIUM_KEY;
export type ChummerFile =
    'actions' | 'armor' | 'bioware' | 'books' | 'complexforms' | 'contacts' | 'critterpowers' |
    'critters' | 'cyberware' | 'drugcomponents' | 'echoes' | 'gear' | 'improvements' | 'licenses' |
    'lifemodules' | 'lifestyles' | 'martialarts' | 'mentors' | 'metamagic' | 'metatypes' |
    'options' | 'packs' | 'paragons' | 'powers' | 'priorities' | 'programs' | 'qualities' | 'ranges' |
    'references' | 'settings' | 'sheets' | 'skills' | 'spells' | 'spiritpowers' | 'streams' |
    'strings' | 'tips' | 'traditions' | 'vehicles' | 'vessels' | 'weapons' | '_selectedsetting';

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

    public static readonly shadowrunBooks = [
        { name: "Aetherology", code: "AET", default: true },
        { name: "Assassin's Primer", code: "AP", default: true },
        { name: "Better Than Bad", code: "BTB", default: true },
        { name: "Bloody Business", code: "BLB", default: true },
        { name: "Book of the Lost", code: "BOTL", default: true },
        { name: "Bullets & Bandages", code: "BB", default: true },
        { name: "Chrome Flesh", code: "CF", default: true },
        { name: "Cutting Aces", code: "CA", default: true },
        { name: "Dark Terrors", code: "DTR", default: true },
        { name: "Data Trails", code: "DT", default: true },
        { name: "Data Trails (Dissonant Echoes)", code: "DTD", default: false },
        { name: "Datapuls Österreich (German-Only)", code: "DATG", default: false },
        { name: "Datapuls SOTA 2080 (German-Only)", code: "SOTG", default: false },
        { name: "Datapuls SOX 2080 (German-Only)", code: "SOXG", default: false },
        { name: "Der Almanach - Gratisrollenspieltag 2019 (German-Only)", code: "GRST2019", default: false },
        { name: "Forbidden Arcana", code: "FA", default: true },
        { name: "Grimmes Erwachen (German-Only)", code: "GE", default: false },
        { name: "Gun Heaven 3", code: "GH3", default: true },
        { name: "Datapuls Hamburg (German-Only)", code: "HAMG", default: false },
        { name: "Hard Targets", code: "HT", default: true },
        { name: "Hong Kong Sourcebook", code: "HKS", default: false },
        { name: "Howling Shadows", code: "HS", default: true },
        { name: "Kill Code", code: "KC", default: true },
        { name: "Krime Katalog", code: "KK", default: true },
        { name: "Lockdown", code: "LCD", default: true },
        { name: "No Future", code: "NF", default: true },
        { name: "Nothing Personal", code: "NP", default: true },
        { name: "Rigger 5.0", code: "R5", default: true },
        { name: "Run Faster", code: "RF", default: true },
        { name: "Run and Gun", code: "RG", default: true },
        { name: "Parabotany (German-Only)", code: "PBG", default: false },
        { name: "Parageology (German-Only)", code: "PGG", default: false },
        { name: "Parazoology (German-Only)", code: "PZG", default: false },
        { name: "Sail Away, Sweet Sister", code: "SASS", default: true },
        { name: "Schattenhandbuch (German-Only)", code: "SHB", default: false },
        { name: "Schattenhandbuch 2 (German-Only)", code: "SHB2", default: false },
        { name: "Schattenhandbuch 3 (German-Only)", code: "SHB3", default: false },
        { name: "Schattenhandbuch 4 (German-Only)", code: "SHB4", default: false },
        { name: "Schattenload 2 (German-Only)", code: "SLG2", default: false },
        { name: "Schattenload 3 (German-Only)", code: "SLG3", default: false },
        { name: "Schattenload 7 (German-Only)", code: "SLG7", default: false },
        { name: "Shadow Spells", code: "SSP", default: true },
        { name: "Shadowrun 2050 (German-Only)", code: "2050", default: false },
        { name: "Shadowrun 5th Edition", code: "SR5", default: true },
        { name: "Shadowrun Missions 0803: 10 Block Tango", code: "SRM0803", default: true },
        { name: "Shadowrun Missions 0804: Dirty Laundry", code: "SRM0804", default: true },
        { name: "Shadowrun Quick-Start Rules", code: "QSR", default: true },
        { name: "Shadows In Focus: Butte", code: "SFB", default: true },
        { name: "Shadows In Focus: Casablanca-Rabat", code: "SFCR", default: true },
        { name: "Shadows In Focus: Marroco", code: "SFMO", default: true },
        { name: "Shadows In Focus: Metropole", code: "SFME", default: true },
        { name: "Shadows In Focus: San Francisco Metroplex", code: "SFM", default: true },
        { name: "Shadows In Focus: Sioux Nation: Counting Coup", code: "SFCC", default: true },
        { name: "Splintered State", code: "SPS", default: true },
        { name: "Sprawl Wilds", code: "SW", default: true },
        { name: "State of the Art ADL (German-Only)", code: "SAG", default: false },
        { name: "Stolen Souls", code: "SS", default: true },
        { name: "Street Grimoire", code: "SG", default: true },
        { name: "Street Grimoire Errata", code: "SGE", default: true },
        { name: "Street Lethal", code: "SL", default: true },
        { name: "The Complete Trog", code: "TCT", default: true },
        { name: "The Seattle Gambit", code: "TSG", default: true },
        { name: "The Vladivostok Gauntlet", code: "TVG", default: true }
    ] as const;
}
