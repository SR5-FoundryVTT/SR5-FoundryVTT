declare namespace Shadowrun {
    export type Spell = SR5ItemData<SpellData> & {
        type: 'spell';
    };

    export type SpellData = SpellPartData & DescriptionPartData & ActionPartData;

    export type SpellCateogry = 'combat' | 'detection' | 'health' | 'illusion' | 'manipulation' | '';
    export type SpellType = 'physical' | 'mana' | '';
    export type SpellRange = 'touch' | 'los' | 'los_a' | '';
    export type SpellDuration = 'instant' | 'sustained' | 'permanent' | '';
    export type CombatSpellData = {
        type: 'direct' | 'indirect' | '';
    };
    export type DetectionSpellData = {
        passive: boolean;
        type: 'directional' | 'psychic' | 'area' | '';
        extended: boolean;
    };
    export type IllusionSpellData = {
        type: 'obvious' | 'realistic' | '';
        sense: 'single-sense' | 'multi-sense' | '';
    };
    export type ManipulationSpellData = {
        damaging: boolean;
        mental: boolean;
        environmental: boolean;
        physical: boolean;
    };
    export type SpellPartData = {
        drain: number;
        category: SpellCateogry;
        type: SpellType;
        range: SpellRange;
        duration: SpellDuration;

        combat: CombatSpellData;
        detection: DetectionSpellData;
        illusion: IllusionSpellData;
        manipulation: ManipulationSpellData;
    };
}
