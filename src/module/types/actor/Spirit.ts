/// <reference path="../Shadowrun.ts" />

declare namespace Shadowrun {
    export type SpiritType = keyof typeof SR5CONFIG.spiritTypes;

    export type SR5SpiritType = SR5ActorBase & {
        data: SpiritData;
        type: 'spirit';
    };
    export type SpiritData = MagicActorData &
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
