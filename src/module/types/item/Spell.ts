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
    export interface AlchemySpellData {
        alchemy: {
            preparation: boolean;
            trigger: AlchemyTrigger;
        }
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
        ritual: RitualSpellData;
        alchemy: AlchemySpellData;
    }

    export type CombatSpellType = 'direct' | 'indirect' | '';
    export type DetectionSpellType = 'directional' | 'psychic' | 'area' | '';
    export type IllusionSpellType = 'obvious' | 'realistic' | '';
    export type IllusionSpellSense = 'single-sense' | 'multi-sense' | '';
    export type SpellCateogry = 'combat' | 'detection' | 'health' | 'illusion' | 'manipulation' | 'ritual' | '';
    export type SpellType = 'physical' | 'mana' | '';
    export type SpellRange = 'touch' | 'los' | 'los_a' | '';
    export type SpellDuration = 'instant' | 'sustained' | 'permanent' | '';
    export type RitualType = 'anchored' | 'material_link' | 'minion' | 'spell' | 'spotter' | '';
    export type AlchemyTrigger = 'command' | 'contact' | 'time'
}
