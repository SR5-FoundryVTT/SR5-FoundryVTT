/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type SR5ActorSheetData = ActorSheetData & {
        data: SR5ActorData;
        filters: SR5SheetFilters;
    };

    export type SR5SheetFilters = {
        skills: string;
    };

    export type SR5ActorData = ActorData & {
        attributes: Attributes;
        limits: Limits;
        skills: {
            active: Skills;
            language: KnowledgeSkillList;
            knowledge: KnowledgeSkills;
        };
        track: Tracks;
        movement: Movement;
        matrix: Matrix;
        magic: Magic;
        modifiers: Modifiers;
        special: SpecialTrait;
    };

    export type Modifiers = {
        [name: string]: number;
    };

    export type SkillEditFormData = BaseEntitySheetData & {
        data?: SkillField;
        editable_name?: boolean;
    };
}
