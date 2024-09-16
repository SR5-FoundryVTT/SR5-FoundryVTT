/// <reference path="../Shadowrun.d.ts" />

declare namespace Shadowrun {
    export interface CharacterSkills {
        active: Skills
        language: KnowledgeSkillList
        knowledge: KnowledgeSkills
    }

    export interface CharacterData extends
        CommonData,
        MatrixNetworkActorData,
        TwoTrackActorData,
        ArmorActorData,
        MagicActorData,
        WoundsActorData,
        MovementActorData,
        TechnomancerActorData,
        NPCActorData {
            attributes: CharacterAttributes
            values: PhysicalCombatValues
            metatype: string | keyof typeof SR5CONFIG.character.types;
            full_defense_attribute: string;
            // Can a character have critter powers?
            is_critter: boolean;
            // modifiers: CharacterModifiers;
            limits: CharacterLimits
            modifiers: Modifiers & CharacterModifiers
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

    export type TechnomancerActorData = {
        technomancer: {
            // Fade test attribute
            attribute: ActorAttribute
            submersion: number
        }
    }

    export type MatrixActorData = {
        matrix: MatrixData;
    }

    // Allow the actor to connect to a host/grid
    export type MatrixNetworkActorData = MatrixActorData & {
        matrix: MatrixNetworkData;
    }

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
        skill: SkillField
        editable_name?: boolean
        editable_canDefault: boolean
        editable_attribute: boolean
        attributes: object
    };

    export interface CommonModifiers {
        // Meant to be applied on all defense tests.
        defense: NumberOrEmpty
        // Meant to be applied on some defense tests that apply the defense modifier.
        ['defense_dodge']: NumberOrEmpty
        ['defense_parry']: NumberOrEmpty
        ['defense_block']: NumberOrEmpty
        ['defense_melee']: NumberOrEmpty
        ['defense_ranged']: NumberOrEmpty

        // Meant to be applied on physical resist (soak) tests.
        soak: NumberOrEmpty
        // Meant to be applied to all ranged attack tests.
        recoil: NumberOrEmpty
    }

    interface MatrixModifiers {
        matrix_initiative: NumberOrEmpty
        matrix_initiative_dice: NumberOrEmpty
        matrix_track: NumberOrEmpty
    }

    /**
     * These modifiers are available for Character type actors.
     * 
     * This interface must correspond with modifiers inject during character data prep.
     */
    export interface CharacterModifiers extends CommonModifiers, MatrixModifiers {
        drain: NumberOrEmpty
        armor: NumberOrEmpty
        physical_limit: NumberOrEmpty
        astral_limit: NumberOrEmpty
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
        // Meant to be applied on all defense test, for defense modifiers after multiple attacks.
        multi_defense: NumberOrEmpty
        reach: NumberOrEmpty
    }

    /**
     * Actor data that can be Grunts.
     */
    type GruntActorData = CharacterData | SpiritData | CritterData;

    /**
     * These attributes are always available for this actor type.
     */
    interface CharacterAttributes extends Attributes {
        initiation: AttributeField
        submersion: AttributeField
    }
}
