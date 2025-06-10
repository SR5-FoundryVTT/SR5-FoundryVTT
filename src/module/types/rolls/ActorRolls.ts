/// <reference path="../Shadowrun.ts" />
declare namespace Shadowrun {

    type SkillRollOptions = ActorRollOptions & {
        // A specialization should be used.
        specialization?: boolean
        // Skills should be searched not by id but their label.
        byLabel?: boolean
        threshold?: BaseValuePair<number>
    };

}
