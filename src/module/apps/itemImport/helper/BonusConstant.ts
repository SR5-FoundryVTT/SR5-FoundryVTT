import { ItemDataSource } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/data.mjs/itemData';
import { BonusSchema } from '../schema/BonusSchema';

import EffectTagsData = Shadowrun.EffectTagsData;
import EffectOptionsData = Shadowrun.EffectOptionsData;

import ShadowrunItemData = Shadowrun.ShadowrunItemData;
import ShadowrunActorData = Shadowrun.ShadowrunActorData;

export type ShadowrunSheetData = (
    ShadowrunItemData | ShadowrunActorData
) & {
    effects?: EffectOptionsData[];
    flags?: { shadowrun5e: { embeddedItems: ItemDataSource[] } };
};

export type ActiveEffectMode = typeof CONST.ACTIVE_EFFECT_MODES[keyof typeof CONST.ACTIVE_EFFECT_MODES];
export const { CUSTOM, MULTIPLY, ADD, DOWNGRADE, UPGRADE, OVERRIDE } = CONST.ACTIVE_EFFECT_MODES;
export type EffectChangeParameter = { key: string; value: string | number; mode?: number; priority?: ActiveEffectMode; }

export class BonusConstant {
    public static skillGroupTable: Record<string, string[]> = {
        "Acting": ["con", "impersonation", "performance"],
        "Athletics": ["gymnastics", "running", "swimming", "flight"],
        "Biotech": ["cybertechnology", "first_aid", "medicine"],
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

    public static skillCategoryTable: Record<string, string[]> = {
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

    public static simpleEffects: Partial<Record<
        keyof BonusSchema,
        Omit<EffectChangeParameter, 'value'> & { overrides?: Partial<EffectOptionsData>; tags?: Partial<EffectTagsData> }
    >> = {
        accel: { key: "system.vehicle_stats.acceleration.mod" },
        armor: { key: "system.armor.mod", overrides: { name: "Add Armor" } },
        body: { key: "system.attributes.body.mod" },
        composure: { key: "system.modifiers.composure" },
        damageresistance: {
            key: "data.modifiers.mod",
            overrides: { name: "Add Damage Resistance" },
            tags: { selection_tests: '[{"value":"Physical Damage Resist", "id":"PhysicalResistTest"}]' }
        },
        drainresist: {
            key: "data.modifiers.mod",
            overrides: { name: "Add Drain Resistance" },
            tags: { selection_tests: '[{"value":"Drain Test", "id":"DrainTest"}]' }
        },
        handling: { key: "system.vehicle_stats.handling.mod" },
        initiativedice: { key: "system.modifiers.meat_initiative_dice", overrides: { name: "Increase Initiative Dice" } },
        judgeintentions: { key: "system.modifiers.judge_intentions" },
        matrixinitiativediceadd: { key: "system.modifiers.matrix_initiative_dice", overrides: { name: "Increase Matrix Initiative Dice" } },
        mentallimit: { key: "system.limits.mental.mod" },
        memory: { key: "system.modifiers.memory" },
        offroadhandling: { key: "system.vehicle_stats.off_road_handling.mod" },
        offroadspeed: { key: "system.vehicle_stats.off_road_speed.mod" },
        pilot: { key: "system.vehicle_stats.pilot.mod" },
        physicalcmrecovery: {
            key: "data.modifiers.mod",
            overrides: { name: "Natural Recovery Physical" },
            tags: { selection_tests: '[{"value":"Natural Recovery Physical", "id":"NaturalRecoveryPhysicalTest"}]' }
        },
        physicallimit: { key: "system.limits.physical.mod" },
        reach: { key: "system.modifiers.reach" },
        seats: { key: "system.vehicle_stats.seats.mod" },
        sensor: { key: "system.vehicle_stats.sensor.mod" },
        speed: { key: "system.vehicle_stats.speed.mod" },
        spellresistance: {
            key: "data.modifiers.mod",
            overrides: { name: "Add Spell Resistance" },
            tags: { selection_tests: '[{"value":"Combat Spell Defense","id":"CombatSpellDefenseTest"}]' }
        },
        stuncmrecovery: {
            key: "data.modifiers.mod",
            overrides: { name: "Natural Recovery Stun" },
            tags: { selection_tests: '[{"value":"Natural Recovery Stun", "id":"NaturalRecoveryStunTest"}]' }
        }
    } as const;
}
