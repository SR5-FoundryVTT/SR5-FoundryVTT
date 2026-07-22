import { ModifiableValue } from "@/module/mods/ModifiableValue";
import { ModifiableValueType } from "@/module/types/template/Base";

export class MovementPrep {
    static prepareMovement(system: Actor.SystemOfType<'character' | 'spirit'>, outOfPlace = false) {
        const { attributes, modifiers } = system;

        const movement = system.movement;
        // default movement: WALK = AGI * 2, RUN = AGI * 4
        movement.walk.base = attributes.agility.value * (2 + modifiers.walk);
        movement.run.base = attributes.agility.value * (4 + modifiers.run);

        const resolve = <F extends ModifiableValueType>(field: F) => outOfPlace ?
            ModifiableValue.applyChanges(field, undefined, { min: 0 }) :
            ModifiableValue.calcTotal(field, { min: 0 });
        resolve(movement.walk);
        resolve(movement.run);
    }
}
