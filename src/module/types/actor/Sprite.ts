/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SpriteType = keyof typeof SR5CONFIG.spriteTypes;

    export type SR5SpriteType = SR5ActorBase & {
        data: SpriteData;
        type: 'sprite';
    };
    export type SpriteData = MatrixActorData & {
        level: number;
        services: number;
        registered: boolean;
        spriteType: SpriteType;
        attributes: Attributes;
        limits: Limits;
        skills: {
            active: Skills;
            language: KnowledgeSkillList;
            knowledge: KnowledgeSkills;
        };
        special: SpecialTrait;
        initiative: Initiative;
        modifiers: Modifiers;
    };

}
