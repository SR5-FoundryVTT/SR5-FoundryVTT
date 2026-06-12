import { BonusSchema } from '../schema/BonusSchema';

export type DocCreateData = (
    Actor.CreateData | Item.CreateData
) & { effects?: any[] };

export type AECreateData = Omit<ActiveEffect.CreateData, "name"> & { name?: string, changes?: any[] };

export type ActiveEffectMode = typeof CONST.ACTIVE_EFFECT_MODES[keyof typeof CONST.ACTIVE_EFFECT_MODES];
export const { MULTIPLY, ADD, DOWNGRADE, UPGRADE, OVERRIDE } = CONST.ACTIVE_EFFECT_MODES;
export type EffectChangeParameter = { key: string; value: string | number; mode?: number; priority?: ActiveEffectMode; };

export class BonusConstant {
    public static readonly skillGroupTable = {
        "Acting": ["con", "impersonation", "performance"],
        "Athletics": ["gymnastics", "running", "swimming", "flight"],
        "Biotech": ["biotechnology", "cybertechnology", "first_aid", "medicine"],
        "Close Combat": ["blades", "clubs", "unarmed_combat"],
        "Conjuring": ["banishing", "binding", "summoning"],
        "Cracking": ["cybercombat", "electronic_warfare", "hacking"],
        "Electronics": ["computer", "hardware", "software"],
        "Enchanting": ["alchemy", "artificing", "disenchanting"],
        "Firearms": ["automatics", "longarms", "pistols"],
        "Influence": ["etiquette", "leadership", "negotiation"],
        "Engineering": ["aeronautics_mechanic", "automotive_mechanic", "industrial_mechanic", "nautical_mechanic"],
        "Outdoors": ["navigation", "survival", "tracking"],
        "Sorcery": ["counterspelling", "ritual_spellcasting", "spellcasting"],
        "Stealth": ["disguise", "palming", "sneaking"],
        "Tasking": ["compiling", "decompiling", "registering"],
    } as const;

    public static readonly skillCategoryTable = {
        "Combat Active": ["archery", "automatics", "blades", "clubs", "exotic_melee_weapon", "exotic_ranged_weapon", "heavy_weapons", "longarms", "pistols", "throwing_weapons", "unarmed_combat"],
        "Physical Active": ["disguise", "diving", "escape_artist", "flight", "free_fall", "gymnastics", "palming", "perception", "running", "sneaking", "survival", "swimming", "tracking"],
        "Social Active": ["con", "etiquette", "impersonation", "instruction", "intimidation", "leadership", "negotiation", "performance"],
        "Magical Active": ["alchemy", "artificing", "assensing", "astral_combat", "banishing", "binding", "counterspelling", "disenchanting", "ritual_spellcasting", "spellcasting", "summoning"],
        "Pseudo-Magical Active": ["arcana"],
        "Resonance Active": ["compiling", "decompiling", "registering"],
        "Technical Active": ["aeronautics_mechanic", "animal_handling", "armorer", "artisan", "automotive_mechanic", "biotechnology", "chemistry", "computer", "cybercombat", "cybertechnology",
            "demolitions", "electronic_warfare", "first_aid", "forgery", "hacking", "hardware", "industrial_mechanic", "locksmith", "medicine", "nautical_mechanic", "navigation", "software"],
        "Vehicle Active": ["pilot_exotic_vehicle", "gunnery", "pilot_aerospace", "pilot_aircraft", "pilot_ground_craft", "pilot_walker", "pilot_watercraft"],
        //TODO knowledge skill category
        "Academic": [],
        "Interest": [],
        "Language": [],
        "Professional": [],
        "Street": [],
    } as const;

    public static readonly simpleEffects = {
        accel: { changes: [{ key: "system.vehicle_stats.acceleration" }] },
        armor: {
            name: "Add Armor",
            changes: [{ key: "system.armor.rating" }]
        },
        body: { changes: [{ key: "system.attributes.body" }] },
        coldarmor: { changes: [{ key: "system.armor.elements.cold" }] },
        composure: { changes: [{ key: "system.modifiers.composure" }] },
        damageresistance: {
            name: "Add Damage Resistance",
            changes: [{ key: "data.pool" }],
            system: { applyTo: 'test_all', selection_tests: ["PhysicalResistTest"] },
        },
        defensetest: {
            changes: [{ key: "data.pool" }],
            system: { applyTo: 'test_all', selection_tests: ["PhysicalDefenseTest", "SuppressionDefenseTest"]},
        },
        dodge: {
            changes: [{ key: "data.pool" }],
            system: { applyTo: 'test_all', selection_tests: ["PhysicalDefenseTest", "SuppressionDefenseTest"]},
        },
        drainresist: {
            name: "Add Drain Resistance",
            changes: [{ key: "data.pool" }],
            system: { applyTo: 'test_all', selection_tests: ["DrainTest"] },
        },
        electricityarmor: { changes: [{ key: "system.armor.elements.electricity" }] },
        essencemax: { changes: [{ key: "system.attributes.essence.base" }] },
        essencepenalty: { changes: [{ key: "system.attributes.essence" }] },
        fadingresist: {
            name: "Add Fading Resistance",
            changes: [{ key: "data.pool" }],
            system: { applyTo: 'test_all', selection_tests: ["FadeTest"] },
        },
        firearmor: { changes: [{ key: "system.armor.elements.fire" }] },
        handling: { changes: [{ key: "system.vehicle_stats.handling" }] },
        initiative: { changes: [{ key: "system.initiative.meatspace.constant" }] },
        initiativedice: { changes: [{ key: "system.initiative.meatspace.dice" }] },
        initiativepass: { changes: [{ key: "system.initiative.meatspace.dice" }] },
        judgeintentions: { changes: [{ key: "system.modifiers.judge_intentions"}] },
        matrixinitiativediceadd: { changes: [{ key: "system.initiative.matrix.dice" }] },
        mentallimit: { changes: [{ key: "system.limits.mental" }] },
        memory: { changes: [{ key: "system.modifiers.memory" }] },
        offroadaccel: { changes: [{ key: "system.vehicle_stats.off_road_acceleration" }] },
        offroadhandling: { changes: [{ key: "system.vehicle_stats.off_road_handling" }] },
        offroadspeed: { changes: [{ key: "system.vehicle_stats.off_road_speed" }] },
        pilot: { changes: [{ key: "system.vehicle_stats.pilot" }] },
        physicalcmrecovery: {
            name: "Natural Recovery Physical",
            changes: [{ key: "data.pool" }],
            system: { applyTo: 'test_all', selection_tests: ["NaturalRecoveryPhysicalTest"] }
        },
        physicallimit: { changes: [{ key: "system.limits.physical" }] },
        reach: { changes: [{ key: "system.modifiers.reach" }] },
        seats: { changes: [{ key: "system.vehicle_stats.seats" }] },
        sensor: { changes: [{ key: "system.vehicle_stats.sensor" }] },
        sociallimit: { changes: [{ key: "system.limits.social" }] },
        speed: { changes: [{ key: "system.vehicle_stats.speed" }] },
        spellresistance: {
            name: "Add Spell Resistance",
            changes: [{ key: "data.pool" } ],
            system: { applyTo: 'test_all', selection_tests: ["CombatSpellDefenseTest"] }
        },
        stuncmrecovery: {
            name: "Natural Recovery Stun",
            changes: [{ key: "data.pool" }],
            system: { applyTo: 'test_all', selection_tests: ["NaturalRecoveryStunTest"] }
        }
    } as const satisfies Partial< Record< keyof BonusSchema, AECreateData > >;
}
