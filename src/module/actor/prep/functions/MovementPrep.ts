import { ModifiableValue } from "@/module/mods/ModifiableValue";

export class MovementPrep {
    static prepareMovement(system: Actor.SystemOfType<'character' | 'spirit'>) {
        const { attributes, modifiers } = system;

        const movement = system.movement;
        // default movement: WALK = AGI * 2, RUN = AGI * 4
        movement.walk.base = attributes.agility.value * (2 + modifiers.walk);
        movement.run.base = attributes.agility.value * (4 + modifiers.run);

        ModifiableValue.calcTotal(movement.walk, { min: 0 });
        ModifiableValue.calcTotal(movement.run, { min: 0 });
    }
}
