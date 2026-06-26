import { BonusSchema } from '../schema/BonusSchema';

export type DocCreateData = (
    Actor.CreateData | Item.CreateData
) & { effects?: any[] };

export type AECreateData = Omit<ActiveEffect.CreateData, "name"> & {
    name?: string;
    system?: Record<string, unknown> & { changes?: any[] };
};

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
        accel: { system: { changes: [{ key: "system.vehicle_stats.acceleration" }] } },
        armor: {
            name: "Add Armor",
            system: { changes: [{ key: "system.armor.rating" }] }
        },
        body: { system: { changes: [{ key: "system.attributes.body" }] } },
        coldarmor: { system: { changes: [{ key: "system.armor.elements.cold" }] } },
        composure: { system: { changes: [{ key: "system.modifiers.composure" }] } },
        damageresistance: {
            name: "Add Damage Resistance",
            system: {
                changes: [{ key: "data.pool", target: 'phys_resist' }],
                targets: [{ id: 'phys_resist', applyTo: 'test_all', conditions: [{ type: 'tests', values: ["PhysicalResistTest"] }] }],
            },
        },
        defensetest: {
            system: {
                changes: [{ key: "data.pool", target: 'defense' }],
                targets: [{ id: 'defense', applyTo: 'test_all', conditions: [{ type: 'tests', values: ["PhysicalDefenseTest", "SuppressionDefenseTest"] }] }],
            },
        },
        dodge: {
            system: {
                changes: [{ key: "data.pool", target: 'defense' }],
                targets: [{ id: 'defense', applyTo: 'test_all', conditions: [{ type: 'tests', values: ["PhysicalDefenseTest", "SuppressionDefenseTest"] }] }],
            },
        },
        drainresist: {
            name: "Add Drain Resistance",
            system: {
                changes: [{ key: "data.pool", target: 'drain_resist' }],
                targets: [{ id: 'drain_resist', applyTo: 'test_all', conditions: [{ type: 'tests', values: ["DrainTest"] }] }],
            },
        },
        electricityarmor: { system: { changes: [{ key: "system.armor.elements.electricity" }] } },
        essencemax: { system: { changes: [{ key: "system.attributes.essence.base" }] } },
        essencepenalty: { system: { changes: [{ key: "system.attributes.essence" }] } },
        fadingresist: {
            name: "Add Fading Resistance",
            system: {
                changes: [{ key: "data.pool", target: 'fading_resist' }],
                targets: [{ id: 'fading_resist', applyTo: 'test_all', conditions: [{ type: 'tests', values: ["FadeTest"] }] }],
            },
        },
        firearmor: { system: { changes: [{ key: "system.armor.elements.fire" }] } },
        handling: { system: { changes: [{ key: "system.vehicle_stats.handling" }] } },
        initiative: { system: { changes: [{ key: "system.initiative.meatspace.constant" }] } },
        initiativedice: { system: { changes: [{ key: "system.initiative.meatspace.dice" }] } },
        initiativepass: { system: { changes: [{ key: "system.initiative.meatspace.dice" }] } },
        judgeintentions: { system: { changes: [{ key: "system.modifiers.judge_intentions"}] } },
        matrixinitiativediceadd: { system: { changes: [{ key: "system.initiative.matrix.dice" }] } },
        mentallimit: { system: { changes: [{ key: "system.limits.mental" }] } },
        memory: { system: { changes: [{ key: "system.modifiers.memory" }] } },
        offroadaccel: { system: { changes: [{ key: "system.vehicle_stats.off_road_acceleration" }] } },
        offroadhandling: { system: { changes: [{ key: "system.vehicle_stats.off_road_handling" }] } },
        offroadspeed: { system: { changes: [{ key: "system.vehicle_stats.off_road_speed" }] } },
        pilot: { system: { changes: [{ key: "system.vehicle_stats.pilot" }] } },
        physicalcmrecovery: {
            name: "Natural Recovery Physical",
            system: {
                changes: [{ key: "data.pool", target: 'recovery_phys' }],
                targets: [{ id: 'recovery_phys', applyTo: 'test_all', conditions: [{ type: 'tests', values: ["NaturalRecoveryPhysicalTest"] }] }],
            },
        },
        physicallimit: { system: { changes: [{ key: "system.limits.physical" }] } },
        reach: { system: { changes: [{ key: "system.modifiers.reach" }] } },
        seats: { system: { changes: [{ key: "system.vehicle_stats.seats" }] } },
        sensor: { system: { changes: [{ key: "system.vehicle_stats.sensor" }] } },
        sociallimit: { system: { changes: [{ key: "system.limits.social" }] } },
        speed: { system: { changes: [{ key: "system.vehicle_stats.speed" }] } },
        spellresistance: {
            name: "Add Spell Resistance",
            system: {
                changes: [{ key: "data.pool", target: 'spell_resist' }],
                targets: [{ id: 'spell_resist', applyTo: 'test_all', conditions: [{ type: 'tests', values: ["CombatSpellDefenseTest"] }] }],
            },
        },
        stuncmrecovery: {
            name: "Natural Recovery Stun",
            system: {
                changes: [{ key: "data.pool", target: 'recovery_stun' }],
                targets: [{ id: 'recovery_stun', applyTo: 'test_all', conditions: [{ type: 'tests', values: ["NaturalRecoveryStunTest"] }] }],
            },
        }
    } as const satisfies Partial< Record< keyof BonusSchema, AECreateData > >;
}
