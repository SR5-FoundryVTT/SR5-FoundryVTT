/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SR5ActorSheetData = ActorSheetData & {
        data: SR5ActorData;
        filters: SR5SheetFilters;
    };

    export type SR5SheetFilters = {
        skills: string;
    };

    export type SR5ActorType = SR5SpiritType | SR5CharacterType | SR5SpriteType;

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
    };
    export type SR5SpriteType = SR5ActorBase & {
        data: SpriteActorData;
        type: 'sprite';
    };

    export type SR5ActorData = SpiritActorData | CharacterActorData | SpriteActorData;

    export type SpiritActorData = MagicActorData &
        TwoTrackActorData &
        ArmorActorData &
        WoundsActorData &
        MovementActorData & {
            spiritType: SpiritType;
            force: number;
            attributes: Attributes;
            limits: Limits;
            skills: {
                active: Skills;
                language: KnowledgeSkillList;
                knowledge: KnowledgeSkills;
            };
            modifiers: Modifiers;
            special: SpecialTrait;
            initiative: Initiative;
        };

    export type CharacterActorData = MatrixActorData &
        TwoTrackActorData &
        ArmorActorData &
        MagicActorData &
        WoundsActorData &
        MovementActorData & {
            attributes: Attributes;
            limits: Limits;
            skills: {
                active: Skills;
                language: KnowledgeSkillList;
                knowledge: KnowledgeSkills;
            };
            modifiers: Modifiers;
            special: SpecialTrait;
            initiative: Initiative;
            recoil_compensation: number;
        };

    export type SpriteActorData = MatrixActorData & {
        level: number;
        services: number;
        registered: boolean;
        spriteType: SpriteType;
        attributes: Attributes;
        limits: Limits;
        skills: {
            active: Skills;
            language: KnowledgeSkillList;
            knowledge: KnowledgeSkills;
        };
        special: SpecialTrait;
        initiative: Initiative;
        modifiers: Modifiers;
    };

    export type MovementActorData = {
        movement: Movement;
    };

    export type ArmorActorData = {
        armor: ActorArmor;
    };

    export type WoundsActorData = {
        wounds: WoundType;
    }

    export type TwoTrackActorData = {
        track: Tracks;
    };

    export type MagicActorData = {
        magic: Magic;
    };

    export type MatrixActorData = {
        matrix: ActorMatrix;
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
