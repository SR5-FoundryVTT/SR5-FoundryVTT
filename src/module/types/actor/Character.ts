/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export interface CharacterSkills {
        active: Skills
        language: KnowledgeSkillList
        knowledge: KnowledgeSkills
    }

    export interface CharacterData extends
        CommonData,
        MatrixActorData,
        TwoTrackActorData,
        ArmorActorData,
        MagicActorData,
        WoundsActorData,
        MovementActorData,
        NPCActorData {
            recoil_compensation: number;
            metatype: string | keyof typeof SR5CONFIG.character.types;
            full_defense_attribute: string;
            // Can a character have critter powers?
            is_critter: boolean;
    }

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
        magic: MagicData;
    };

    export type MatrixActorData = {
        matrix: MatrixData;
    };

    export type NPCActorData = {
        is_npc: boolean;
        npc: NPCData
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

    export type SkillEditFormData = {
        data?: SkillField
        editable_name?: boolean
        editable_canDefault: boolean
        editable_attribute: boolean
        attributes: object
    };
}
