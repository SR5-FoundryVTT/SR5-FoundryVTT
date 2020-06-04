declare namespace Shadowrun {
    export type Attributes = {
        [name: string]: AttributeField;
    };

    export type AttributeField = BaseValuePair<number> & HideableField & ModifiableValue & LabelField;

    export type Skills = {
        [name: string]: SkillField;
    };

    export type RemovableSkills = {
        [name: string]: SkillField & RemovableField;
    }

    export type SkillField = BaseValuePair<number> & HideableField & ModifiableValue & LabelField;

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
    }

    export type LimitField = BaseValuePair<number> & ModifiableValue & HideableField & LabelField;

    export type Tracks = {
        physical: ValueMaxPair<number> & LabelField & Overflow;
        stun: ValueMaxPair<number> & LabelField;
    }

    export type Overflow = {
        overflow: ValueMaxPair<number>;
    }
}
