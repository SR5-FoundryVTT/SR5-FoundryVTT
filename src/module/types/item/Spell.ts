declare namespace Shadowrun {
    export interface SpellData extends
        SpellPartData,
        DescriptionPartData,
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
    export interface SpellPartData {
        type: SpellType;
        category: SpellCateogry;
        drain: number;
        range: SpellRange;
        duration: SpellDuration;
        extended: boolean;

        combat: CombatSpellData;
        detection: DetectionSpellData;
        illusion: IllusionSpellData;
        manipulation: ManipulationSpellData;
    }

    export type CombatSpellType = 'direct' | 'indirect' | '';
    export type DetectionSpellType = 'directional' | 'psychic' | 'area' | '';
    export type IllusionSpellType = 'obvious' | 'realistic' | '';
    export type IllusionSpellSense = 'single-sense' | 'multi-sense' | '';
    export type SpellCateogry = 'combat' | 'detection' | 'health' | 'illusion' | 'manipulation' | '';
    export type SpellType = 'physical' | 'mana' | '';
    export type SpellRange = 'touch' | 'los' | 'los_a' | '';
    export type SpellDuration = 'instant' | 'sustained' | 'permanent' | '';
}
