import { BonusSchema } from '../schema/BonusSchema';

export type DocCreateData = (
    Actor.CreateData | Item.CreateData
) & { effects?: any[] };

export type AECreateData = Omit<ActiveEffect.CreateData, "name"> & { name?: string, changes?: any[] };

export type ActiveEffectMode = typeof CONST.ACTIVE_EFFECT_MODES[keyof typeof CONST.ACTIVE_EFFECT_MODES];
export const { CUSTOM: MODIFY, MULTIPLY, ADD, DOWNGRADE, UPGRADE, OVERRIDE } = CONST.ACTIVE_EFFECT_MODES;
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
        accel: { changes: [{ key: "system.vehicle_stats.acceleration" }] },
        armor: { changes: [{ key: "system.armor" }] },
        body: { changes: [{ key: "system.attributes.body" }] },
        composure: { changes: [{ key: "system.modifiers.composure" }] },
        damageresistance: {
            changes: [{ key: "data.modifiers" }],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Physical Damage Resistance", id: "PhysicalResistTest" }] },
        },
        defensetest: {
            changes: [{ key: "data.modifiers" }],
            system: { applyTo: 'test_all', selection_tests: [
                { value: "Physical Defense", id: "PhysicalDefenseTest" },
                { value: "Suppression Defense", id: "SuppressionDefenseTest" }
            ]},
        },
        dodge: {
            changes: [{ key: "data.modifiers" }],
            system: { applyTo: 'test_all', selection_tests: [
                { value: "Physical Defense", id: "PhysicalDefenseTest" },
                { value: "Suppression Defense", id: "SuppressionDefenseTest" }
            ]},
        },
        drainresist: {
            changes: [{ key: "data.modifiers" }],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Drain Resistance", id: "DrainTest" }] },
        },
        essencemax: { changes: [{ key: "system.attributes.essence.base" }] },
        essencepenalty: { changes: [{ key: "system.attributes.essence" }] },
        fadingresist: {
            changes: [{ key: "data.modifiers" }],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Fading Resistance", id: "FadeTest" }] },
        },
        handling: { changes: [{ key: "system.vehicle_stats.handling" }] },
        initiative: { changes: [{ key: "system.modifiers.meat_initiative" }] },
        initiativedice: { changes: [{ key: "system.modifiers.meat_initiative_dice" }] },
        initiativepass: { changes: [{ key: "system.modifiers.meat_initiative_dice" }] },
        judgeintentions: { changes: [{ key: "system.modifiers.judge_intentions"}] },
        matrixinitiativediceadd: { changes: [{ key: "system.modifiers.matrix_initiative_dice" }] },
        mentallimit: { changes: [{ key: "system.limits.mental" }] },
        memory: { changes: [{ key: "system.modifiers.memory" }] },
        offroadhandling: { changes: [{ key: "system.vehicle_stats.off_road_handling" }] },
        offroadspeed: { changes: [{ key: "system.vehicle_stats.off_road_speed" }] },
        pilot: { changes: [{ key: "system.vehicle_stats.pilot" }] },
        physicalcmrecovery: {
            changes: [{ key: "data.modifiers" }],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Physical Recovery", id: "NaturalRecoveryPhysicalTest" }] }
        },
        physicallimit: { changes: [{ key: "system.limits.physical" }] },
        reach: { changes: [{ key: "system.modifiers.reach" }] },
        seats: { changes: [{ key: "system.vehicle_stats.seats" }] },
        sensor: { changes: [{ key: "system.vehicle_stats.sensor" }] },
        speed: { changes: [{ key: "system.vehicle_stats.speed" }] },
        spellresistance: {
            changes: [{ key: "data.modifiers" } ],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Combat Spell Defense", id: "CombatSpellDefenseTest" }] }
        },
        stuncmrecovery: {
            changes: [{ key: "data.modifiers" }],
            system: { applyTo: 'test_all', selection_tests: [{ value: "Stun Recovery", id: "NaturalRecoveryStunTest" }] }
        }
    } as const satisfies Partial< Record< keyof BonusSchema, AECreateData > >;
}
