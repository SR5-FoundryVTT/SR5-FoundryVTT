/// <reference path="./Shadowrun.ts" />
declare namespace Shadowrun {
    export type RollEvent = MouseEvent | { shiftKey?: boolean; altKey?: boolean };

    type ActorRollOptions = {
        event?: RollEvent;
    };
    type DefenseRollOptions = ActorRollOptions & {
        fireModeDefense?: number;
        cover?: number | boolean;
        incomingAttack?: AttackData;
    };

    type AttackData = {
        hits: number;
        damage: DamageData;
    };

    type SoakRollOptions = ActorRollOptions & {
        damage?: DamageData;
        attackerHits?: number;
        defenderHits?: number;
        netHits?: number;
    };

    type SkillRollOptions = ActorRollOptions & {
        attribute?: ActorAttribute;
    };
}
