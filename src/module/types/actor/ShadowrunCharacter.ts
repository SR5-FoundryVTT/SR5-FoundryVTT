/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SR5ActorSheetData = ActorSheetData & {
        data: SR5ActorData;
        filters: SR5SheetFilters;
    };

    export type SR5SheetFilters = {
        skills: string;
    };

    export type SR5ActorType = SR5SpiritType | SR5CharacterType;

    export type SR5ActorBase = ActorData & {
        name: string;
        _id: string;
        folder: string | null;
        data: SR5ActorData;
        items: Collection<Item>;
        flags: object;
        permission: {
            default: string;
        };
    };

    export type SR5SpiritType = SR5ActorBase & {
        data: SpiritActorData;
        type: 'spirit';
    };

    export type SR5CharacterType = SR5ActorBase & {
        data: CharacterActorData;
        type: 'character';
    }

    export type SR5ActorData = SpiritActorData | CharacterActorData;

    export type SpiritActorData = MagicActorData & {
        spiritType: SpiritType;
        force: number;
        attributes: Attributes;
        limits: Limits;
        skills: {
            active: Skills;
            language: KnowledgeSkillList;
            knowledge: KnowledgeSkills;
        };
        track: Tracks;
        movement: Movement;
        modifiers: Modifiers;
        special: SpecialTrait;
        initiative: Initiative;
        armor: ActorArmor;
        wounds: WoundType;
    }

    export type CharacterActorData = MatrixActorData & MagicActorData & {
        attributes: Attributes;
        limits: Limits;
        skills: {
            active: Skills;
            language: KnowledgeSkillList;
            knowledge: KnowledgeSkills;
        };
        track: Tracks;
        movement: Movement;
        modifiers: Modifiers;
        special: SpecialTrait;
        armor: ActorArmor;
        initiative: Initiative;
        wounds: WoundType;
        recoil_compensation: number;
    };

    export type MagicActorData = {
        magic: Magic;
    }

    export type MatrixActorData = {
        matrix: ActorMatrix;
    }

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
