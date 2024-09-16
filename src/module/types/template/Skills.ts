/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type Skills = Record<string, SkillField>;

    export type SkillCategories = 'active'|'language'|'knowledge';

    export type SkillField = BaseValuePair<number> &
        NameField &
        CanHideFiled &
        ModifiableValue &
        LabelField &
        HasBonus &
        HasAttribute &
        RemovableField & {
            specs: string[];
            canDefault: boolean

            // Optional fields not defined within template.json.
            // Use to identify a skill when fetched by its label
            id?: string
            // A pdf-pager <pdf> <page> code to open the rulebook to the skill's description
            link?: string
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
        value: Skills;
    };
}
