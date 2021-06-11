/// <reference path="../Shadowrun.ts" />

// TODO: Check CommonActorData in last commit. Propably moves attributes. limits and so forth into one type.
declare namespace Shadowrun {
    export type CritterType = keyof typeof SR5CONFIG.critterTypes;
    export type CritterData = MagicActorData &
        TwoTrackActorData &
        ArmorActorData &
        WoundsActorData &
        MatrixActorData &
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
    };
}
