/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type RollEvent = MouseEvent | { shiftKey?: boolean; altKey?: boolean };

    type ActorRollOptions = {
        event?: RollEvent
        title?: string
        hideRollMessage?: boolean
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

    // Use for actions with matrix content
    type MatrixActionTestData = {
        marks: number
    }

    type CombatData = {
        initiative?: number
    }

    type ModifiedDamageData = {
        incoming: DamageData
        modified: DamageData
    }

    type DrainData = LabelField & {
        value: number;
    }

    type SoakRollOptions = ActorRollOptions & {
        damage?: DamageData;
        attackerHits?: number;
        defenderHits?: number;
        netHits?: number;
    };

    type SkillRollOptions = ActorRollOptions & {
        // Search not by skill id but by it's label.
        attribute?: string
        specialization?: boolean
    };

    type SkillDialogOptions = {
        skill: SkillField
        attribute?: ActorAttribute
    }
}
