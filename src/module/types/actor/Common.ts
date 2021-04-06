/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type CommonActorData = {
        attributes: Attributes
        limits: Limits
        skills: {
            active: Skills
            language: KnowledgeSkillList
            knowledge: KnowledgeSkills
        }
        special: SpecialTrait
        initiative: Initiative
        modifiers: Modifiers
    }
}