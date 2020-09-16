/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SpiritType = keyof typeof CONFIG.SR5.spiritTypes;

    export type SR5SpiritType = SR5ActorBase & {
        data: SpiritActorData;
        type: 'spirit';
    };
    export type SpiritActorData = MagicActorData &
        TwoTrackActorData &
        ArmorActorData &
        WoundsActorData &
        MovementActorData & {
        spiritType: SpiritType;
        force: number;
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
