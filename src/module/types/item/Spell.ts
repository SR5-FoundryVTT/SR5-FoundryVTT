declare namespace Shadowrun {
    export interface SpellData extends
        SpellPartData,
        DescriptionPartData,
        ImportFlags,
        ActionPartData {

    }

    export interface CombatSpellData {
        type: CombatSpellType;
    }
    export interface DetectionSpellData {
        type: DetectionSpellType;
        passive: boolean;
        extended: boolean;
    }
    export interface IllusionSpellData {
        type: IllusionSpellType;
        sense: IllusionSpellSense;
    }
    export interface ManipulationSpellData {
        damaging: boolean;
        mental: boolean;
        environmental: boolean;
        physical: boolean;
    }
    export interface RitualSpellData {
        ritual: {
            type: string;
        }
    }
    
    export interface SpellPartData {
        type: SpellType;
        category: SpellCategory;
        drain: number;
        range: SpellRange;
        duration: SpellDuration;
        extended: boolean;

        combat: CombatSpellData;
        detection: DetectionSpellData;
        illusion: IllusionSpellData;
        manipulation: ManipulationSpellData;
        ritual: RitualSpellData;
    }

    export type CombatSpellType = 'direct' | 'indirect' | '';
    export type DetectionSpellType = 'directional' | 'psychic' | 'area' | '';
    export type IllusionSpellType = 'obvious' | 'realistic' | '';
    export type IllusionSpellSense = 'single-sense' | 'multi-sense' | '';
    export type SpellCategory = 'combat' | 'detection' | 'health' | 'illusion' | 'manipulation' | 'ritual' | '';
    export type SpellType = 'physical' | 'mana' | '';
    export type SpellRange = 'touch' | 'los' | 'los_a' | '';
    export type SpellDuration = 'instant' | 'sustained' | 'permanent' | '';
    export type RitualType = 'anchored' | 'material_link' | 'minion' | 'spell' | 'spotter' | '';
}
