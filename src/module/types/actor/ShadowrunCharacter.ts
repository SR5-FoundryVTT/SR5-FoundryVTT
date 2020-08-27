/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SR5ActorSheetData = ActorSheetData & {
        data: SR5ActorData;
        filters: SR5SheetFilters;
    };

    export type SR5SheetFilters = {
        skills: string;
    };

    export type SR5ActorType = ActorData & {
        name: string;
        _id: string;
        folder: string | null;
        type: string;
        data: SR5ActorData;
        items: Collection<Item>;
        flags: object;
        permission: {
            default: string;
        };
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
        armor: ActorArmor;
        initiative: Initiative;
        wounds: WoundType;
        recoil_compensation: number;
    };

    export type WoundType = {
        value: number;
    };

    export type Modifiers = {
        [name: string]: NumberOrEmpty;
    };

    export type InitiativeType = {
        base: BaseValuePair<number> & ModifiableValue;
        dice: BaseValuePair<number> &
            ModifiableValue & {
                text: string;
            };
    };

    export type Initiative = {
        perception: string;
        meatspace: InitiativeType;
        matrix: InitiativeType;
        astral: InitiativeType;
        current: InitiativeType;
        edge?: boolean;
    };

    export type SkillEditFormData = BaseEntitySheetData & {
        data?: SkillField;
        editable_name?: boolean;
    };
}
