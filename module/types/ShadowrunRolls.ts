/// <reference path="Shadowrun.ts" />
declare namespace Shadowrun {
    export type RollEvent = MouseEvent | { shiftKey?: boolean; altKey?: boolean };

    type ActorRollOptions = {
        event?: RollEvent;
    };
    type DefenseRollOptions = ActorRollOptions & {
        fireModeDefense?: number;
        cover?: number;
        incomingAttack?: IncomingAttack;
    };

    type IncomingAttack = {
        hits?: number;
        damage: number;
        damageType: DamageType;
        ap: number;
    };

    type SoakRollOptions = ActorRollOptions & Partial<IncomingAttack>;

    type SkillRollOptions = ActorRollOptions & {
        attribute?: ActorAttribute;
    };
}
