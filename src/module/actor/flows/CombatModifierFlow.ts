import { SR5Actor } from "../SR5Actor";
import { ModifiableValueType } from "@/module/types/template/Base";

// Flow for calculating combat roll modifiers for SR5Actor
export const CombatModifierFlow = {
    // Helper to create a modifier object
    _createModifier: (name: string, value: number): ModifiableValueType['changes'][number] => ({
        name, value,
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        priority: 20,
        effectUuid: null,
        enabled: true,
        invalidated: false
    }),

    // Returns charger modifier if actor is running or sprinting
    getChargerModifier: (actor: SR5Actor): ModifiableValueType['changes'][number] | null => {
        const statuses = actor.getStatusEffectsId();
        if (statuses.has('sr5run') || statuses.has('sr5sprint'))
            return CombatModifierFlow._createModifier('Charging', 4);
        return null;
    },

    // Returns target running/sprinting modifier if applicable
    getTargetRunningModifier: (target: SR5Actor): ModifiableValueType['changes'][number] | null => {
        const statuses = target.getStatusEffectsId();
        if (statuses.has('sr5run'))
            return CombatModifierFlow._createModifier('Target Running', -2);
        if (statuses.has('sr5sprint'))
            return CombatModifierFlow._createModifier('Target Sprinting', -4);
        return null;
    }
};
