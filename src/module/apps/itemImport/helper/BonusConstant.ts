import { BonusSchema } from '../schema/BonusSchema';

export type DocCreateData = (
    Actor.CreateData | Item.CreateData
) & { effects?: any[] };

export type AECreateData = Omit<ActiveEffect.CreateData, "name"> & { name?: string, changes?: any[] };

export type ActiveEffectMode = typeof CONST.ACTIVE_EFFECT_MODES[keyof typeof CONST.ACTIVE_EFFECT_MODES];
export const { CUSTOM, MULTIPLY, ADD, DOWNGRADE, UPGRADE, OVERRIDE } = CONST.ACTIVE_EFFECT_MODES;
export type EffectChangeParameter = { key: string; value: string | number; mode?: number; priority?: ActiveEffectMode; };

export class BonusConstant {
    public static skillGroupTable = {
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

    public static skillCategoryTable = {
        "Combat Active": ["archery", "automatics", "blades", "clubs", "exotic_melee", "exotic_range", "heavy_weapons", "longarms", "pistols", "throwing_weapons", "unarmed_combat"],
        "Physical Active": ["disguise", "diving", "escape_artist", "flight", "free_fall", "gymnastics", "palming", "perception", "running", "sneaking", "survival", "swimming", "tracking"],
        "Social Active": ["con", "etiquette", "impersonation", "instruction", "intimidation", "leadership", "negotiation", "performance"],
        "Magical Active": ["alchemy", "artificing", "assensing", "astral_combat", "banishing", "binding", "counterspelling", "disenchanting", "ritual_spellcasting", "spellcasting", "summoning"],
        "Pseudo-Magical Active": ["arcana"],
        "Resonance Active": ["compiling", "decompiling", "registering"],
        "Technical Active": ["aeronautics_mechanic", "animal_handling", "armorer", "artisan", "automotive_mechanic", "biotechnology", "chemistry", "computer", "cybercombat", "cybertechnology",
            "demolitions", "electronic_warfare", "first_aid", "forgery", "hacking", "hardware", "industrial_mechanic", "locksmith", "medicine", "nautical_mechanic", "navigation", "software"],
        "Vehicle Active": ["pilot_exotic_vehicle", "gunnery", "pilot_aerospace", "pilot_aircraft", "pilot_ground_craft", "pilot_walker", "pilot_water_craft"],
        //TODO knowledge skill category
        "Academic": [],
        "Interest": [],
        "Language": [],
        "Professional": [],
        "Street": [],
    } as const;

    public static readonly simpleEffects = {
        accel: { changes: [{ key: "system.vehicle_stats.acceleration.mod" }] },
        armor: {
            name: "Add Armor",
            changes: [{ key: "system.armor.mod" }]
        },
        body: { changes: [{ key: "system.attributes.body.mod" }] },
        composure: { changes: [{ key: "system.modifiers.composure" }] },
        damageresistance: {
            name: "Add Damage Resistance",
            changes: [{ key: "data.modifiers.mod" }],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Physical Damage Resistance", id: "PhysicalResistTest" }] },
        },
        defensetest: { changes: [{ key: "system.modifiers.defense" }] },
        dodge: { changes: [{ key: "system.modifiers.defense" }] },
        drainresist: {
            name: "Add Drain Resistance",
            changes: [{ key: "data.modifiers.mod" }],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Drain Resistance", id: "DrainTest" }] },
        },
        essencemax: { changes: [{ key: "system.attributes.essence.mod" }] },
        fadingresist: {
            name: "Add Fading Resistance",
            changes: [{ key: "data.modifiers.mod" }],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Fading Resistance", id: "FadeTest" }] },
        },
        handling: { changes: [{ key: "system.vehicle_stats.handling.mod" }] },
        initiativedice: {
            name: "Increase Initiative Dice",
            changes: [{ key: "system.modifiers.meat_initiative_dice" }]
        },
        judgeintentions: { changes: [{ key: "system.modifiers.judge_intentions"}] },
        matrixinitiativediceadd: {
            name: "Increase Matrix Initiative Dice",
            changes: [{ key: "system.modifiers.matrix_initiative_dice" }]
        },
        mentallimit: { changes: [{ key: "system.limits.mental.mod" }] },
        memory: { changes: [{ key: "system.modifiers.memory" }] },
        offroadhandling: { changes: [{ key: "system.vehicle_stats.off_road_handling.mod" }] },
        offroadspeed: { changes: [{ key: "system.vehicle_stats.off_road_speed.mod" }] },
        pilot: { changes: [{ key: "system.vehicle_stats.pilot.mod" }] },
        physicalcmrecovery: {
            name: "Natural Recovery Physical",
            changes: [{ key: "data.modifiers.mod" }],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Physical Recovery", id: "NaturalRecoveryPhysicalTest" }] }
        },
        physicallimit: { changes: [{ key: "system.limits.physical.mod" }] },
        reach: { changes: [{ key: "system.modifiers.reach" }] },
        seats: { changes: [{ key: "system.vehicle_stats.seats.mod" }] },
        sensor: { changes: [{ key: "system.vehicle_stats.sensor.mod" }] },
        speed: { changes: [{ key: "system.vehicle_stats.speed.mod" }] },
        spellresistance: {
            name: "Add Spell Resistance",
            changes: [{ key: "data.modifiers.mod" } ],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Combat Spell Defense", id: "CombatSpellDefenseTest" }] }
        },
        stuncmrecovery: {
            name: "Natural Recovery Stun",
            changes: [{ key: "data.modifiers.mod" }],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Stun Recovery", id: "NaturalRecoveryStunTest" }] }
        }
    } as const satisfies Partial< Record< keyof BonusSchema, AECreateData > >;
}
