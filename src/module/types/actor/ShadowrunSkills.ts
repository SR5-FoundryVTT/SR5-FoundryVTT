/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Skills = {
        [id: string]: SkillField;
    };

    export type RemovableSkills = {
        [id: string]: SkillField & RemovableField;
    };

    export type SkillCategories = 'active'|'language'|'knowledge';

    export type SkillField = BaseValuePair<number> &
        NameField &
        CanHideFiled &
        ModifiableValue &
        LabelField &
        HasBonus &
        HasAttribute & {
            specs: string[];
        };

    export type HasAttribute = {
        attribute: ActorAttribute;
    };

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
}
