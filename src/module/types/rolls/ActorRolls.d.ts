/// <reference path="../Shadowrun.d.ts" />
declare namespace Shadowrun {
    export type RollEvent = PointerEvent & { shiftKey?: boolean; altKey?: boolean; ctrlKey?: boolean };

    type ActorRollOptions = {
        event?: RollEvent
    };
    type DefenseRollOptions = ActorRollOptions & {
        fireModeDefense?: number;
        cover?: number | boolean;
        attack?: AttackData;
    };
    type SpellDefenseOptions = ActorRollOptions & {
        attack: AttackData
    }

    // Use for actions with attack content
    type AttackData = {
        hits?: number;
        fireMode?: FireModeData;
        reach?: number;
        force?: number;
        level?: number;
        accuracy?: number;
        damage: DamageData;
        blast?: BlastData;
    };

    type ModifiedDamageData = {
        incoming: DamageData
        modified: DamageData
    }

    type SkillRollOptions = ActorRollOptions & {
        // A specialization should be used.
        specialization?: boolean
        // Skills should be searched not by id but their label.
        byLabel?: boolean
        threshold?: BaseValuePair<number>
    };
}
