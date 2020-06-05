declare namespace Shadowrun {
    export type SR5ActorSheetData = ActorSheetData & {
        data: SR5ActorData;
        filters: SR5SheetFilters;
    };

    export type SR5SheetFilters = {
        skills: string;
    }

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

    export type SpecialTrait = 'magic' | 'resonance' | 'mundane' | '';

    export type Attributes = {
        [name: string]: AttributeField;
    };

    export type AttributeField = BaseValuePair<number> &
        HideableField &
        ModifiableValue &
        LabelField;

    export type Skills = {
        [name: string]: SkillField;
    };

    export type RemovableSkills = {
        [name: string]: SkillField & RemovableField;
    };

    export type SkillField = BaseValuePair<number> & HideableField & ModifiableValue & LabelField & HasAttribute & {
        specs: string[];
    };

    export type HasAttribute = {
        attribute: ActorAttribute;
    }

    export type KnowledgeSkillCategory = keyof KnowledgeSkills;

    export type KnowledgeSkills = {
        street: KnowledgeSkillList;
        academic: KnowledgeSkillList;
        professional: KnowledgeSkillList;
        interests: KnowledgeSkillList;
    };

    export type KnowledgeSkillList = {
        attribute: MentalAttribute;
        value: RemovableSkills;
    };

    export type Limits = {
        [name: string]: LimitField;
    };

    export type LimitField = BaseValuePair<number> & ModifiableValue & HideableField & LabelField;

    export type Tracks = {
        physical: ValueMaxPair<number> & LabelField & ModifiableValue & Overflow;
        stun: ValueMaxPair<number> & LabelField & ModifiableValue;
    };

    export type Overflow = {
        overflow: ValueMaxPair<number>;
    };

    export type Movement = {
        walk: {
            value: number;
            mult: number;
            base: number;
        };
        run: {
            value: number;
            mult: number;
            base: number;
        };
        sprint: number;
        swimming: number;
    };

    export type Matrix = {
        dice: BaseValuePair<number> & ModifiableValue;
        base: BaseValuePair<number> & ModifiableValue;

        attack: AttributeField;
        sleaze: AttributeField;
        data_processing: AttributeField;
        firewall: AttributeField;
    };

    export type Magic = {
        attribute: ActorAttribute;
        projecting: boolean;
        drain: BaseValuePair<number> & ModifiableValue;
    }

    export type Modifiers = {
        [name: string]: number;
    }

    export type SkillEditFormData = BaseEntitySheetData & {
        data?: SkillField;
        editable_name?: boolean;
    }
}
