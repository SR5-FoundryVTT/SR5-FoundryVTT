import { SR5Actor } from "../SR5Actor";
import { ModifiableValueType } from "@/module/types/template/Base";

// Flow for calculating combat roll modifiers for SR5Actor
export const CombatModifierFlow = {
    // Returns prone modifier if source or target is prone
    getProneMeleeModifier: (source: SR5Actor, target?: SR5Actor): ModifiableValueType['mod'][number] | null => {
        const srcProne = source.getStatusEffectsId().has('prone');
        const tgtProne = target?.getStatusEffectsId().has('prone');
        const proneDiff = Number(tgtProne) - Number(srcProne);
        if (proneDiff)
            return { name: `${proneDiff > 0 ? 'Target' : 'Attacker'} Prone`, value: proneDiff };
        return null;
    },

    getProneDefenseModifier: (source: SR5Actor, target?: SR5Actor): ModifiableValueType['mod'][number] | null => {
        return null;
    },

    // Returns charger modifier if actor is running or sprinting
    getChargerModifier: (actor: SR5Actor): ModifiableValueType['mod'][number] | null => {
        const statuses = actor.getStatusEffectsId();
        if (statuses.has('sr5run') || statuses.has('sr5sprint'))
            return { name: 'Charging', value: 4 };
        return null;
    },

    // Returns target running/sprinting modifier if applicable
    getTargetRunningModifier: (target: SR5Actor): ModifiableValueType['mod'][number] | null => {
        const statuses = target.getStatusEffectsId();
        if (statuses.has('sr5run')) 
            return { name: 'Target Running', value: -2 };
        if (statuses.has('sr5sprint')) 
            return { name: 'Target Sprinting', value: -4 };
        return null;
    }
};
