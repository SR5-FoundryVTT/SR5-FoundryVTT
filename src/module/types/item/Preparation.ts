declare namespace Shadowrun {
    export interface PreparationData extends
        PreparationPartData,
        DescriptionPartData,
        ImportFlags,
        ActionPartData {

    }
    
    export interface PreparationPartData {
        type: SpellType;
        category: SpellCategory;
        range: SpellRange;
        duration: SpellDuration;
        force: number;
        potency: number;
        trigger: AlchemyTrigger;

        combat: CombatSpellData;
        detection: DetectionSpellData;
        illusion: IllusionSpellData;
        manipulation: ManipulationSpellData;
    }

    export type AlchemyTrigger = 'command' | 'contact' | 'time'
}