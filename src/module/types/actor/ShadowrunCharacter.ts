/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SR5ActorSheetData = ActorSheet.Data & {
        config: typeof CONFIG.SR5;
        data: SR5ActorData;
        filters: SR5SheetFilters;
        isCharacter: boolean;
        isSpirit: boolean;
        awakened: boolean;
        emerged: boolean;
        woundTolerance: number
    };

    export type SR5SheetFilters = {
        skills: string;
        showUntrainedSkills
    };

    export type SR5ActorType = SR5SpiritType | SR5CharacterType | SR5SpriteType | SR5VehicleType | SR5CritterType;

    // TODO: A lot of duplicate type definitions to what's in Actor.Data. Might cause problems during a FoundryVTT update
    export type SR5ActorBase = Actor.Data & {
        name: string;
        _id: string;
        folder: string | null;
        data: SR5ActorData;
        items: Collection<Item>;
        flags: object;
        type: string;
        permission: {
            default: string;
        };
    };


    export type SR5CharacterType = SR5ActorBase & {
        data: CharacterActorData;
        type: 'character';
    };

    export type SR5ActorData = SpiritActorData | CharacterActorData | SpriteActorData | VehicleActorData | CritterActorData;


    export type CharacterActorData =
        MatrixActorData &
        TwoTrackActorData &
        ArmorActorData &
        MagicActorData &
        WoundsActorData &
        MovementActorData &
        NPCActorData & {
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
            metatype: string | keyof typeof CONFIG.SR5.character.types;
            full_defense_attribute: string;
        };

    export type PhysicalTrackActorData = {
        track: {
            physical: PhysicalTrack;
        };
    };
    export type StunTrackActorData = {
        track: {
            stun: StunTrack;
        };
    };

    export type MovementActorData = {
        movement: Movement;
    };

    export type ArmorActorData = {
        armor: ActorArmor;
    };

    export type WoundsActorData = {
        wounds: WoundType;
    };

    export type TwoTrackActorData = {
        track: Tracks;
    };

    export type MagicActorData = {
        magic: Magic;
    };

    export type MatrixActorData = {
        matrix: ActorMatrix;
    };

    export type NPCActorData = {
        is_npc: boolean;
        npc: NPC
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

    export type SkillEditFormData = BaseEntitySheet.Data & {
        data?: SkillField;
        editable_name?: boolean;
    };
}
