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
            modifiers: CharacterModifiers
            limits: CharacterLimits
    }

    export interface CharacterLimits extends AwakendLimits, MatrixLimits {}

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
        magic: MagicData
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

    /**
     * In general modifiers should always be a number BUT legacy wise there were many issue with strings creeping in.
     */
    export interface Modifiers {
        [name: string]: NumberOrEmpty;
    }

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

    /**
     * These modifiers are available for Character type actors.
     * 
     * This interface must correspond with modifiers inject during character data prep.
     */
    export interface CharacterModifiers extends Modifiers {
        drain: NumberOrEmpty
        armor: NumberOrEmpty
        physical_limit: NumberOrEmpty
        social_limit: NumberOrEmpty
        mental_limit: NumberOrEmpty
        stun_track: NumberOrEmpty
        physical_track: NumberOrEmpty
        physical_overflow_track: NumberOrEmpty
        meat_initiative: NumberOrEmpty
        meat_initiative_dice: NumberOrEmpty
        astral_initiative: NumberOrEmpty
        astral_initiative_dice: NumberOrEmpty
        composure: NumberOrEmpty
        lift_carry: NumberOrEmpty
        judge_intentions: NumberOrEmpty
        memory: NumberOrEmpty
        walk: NumberOrEmpty
        run: NumberOrEmpty
        wound_tolerance: NumberOrEmpty
        pain_tolerance_stun: NumberOrEmpty
        pain_tolerance_physical: NumberOrEmpty
        essence: NumberOrEmpty
        fade: NumberOrEmpty
    }
}
