/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {
    export type RollEvent = PointerEvent & { shiftKey?: boolean; altKey?: boolean; ctrlKey?: boolean };

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
        // A specialization should be used.
        specialization?: boolean
        // Skills should be searched not by id but their label.
        byLabel?: boolean
    };

    type SkillDialogOptions = {
        skill: SkillField
        attribute?: ActorAttribute
    }
}
