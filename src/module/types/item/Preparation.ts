declare namespace Shadowrun {
    export interface PreparationData extends
        PreparationPartData,
        DescriptionPartData,
        ImportFlags,
        ActionPartData {

    }
    
    export interface PreparationPartData {
        type: SpellType;
        category: SpellCateogry;
        range: SpellRange;
        duration: SpellDuration;
        potency: number;
        trigger: AlchemyTrigger;

        combat: CombatSpellData;
        detection: DetectionSpellData;
        illusion: IllusionSpellData;
        manipulation: ManipulationSpellData;
    }

    export type AlchemyTrigger = 'command' | 'contact' | 'time'
}