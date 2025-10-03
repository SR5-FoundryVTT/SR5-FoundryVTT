import { Helpers } from "@/module/helpers";

export class MovementPrep {
    static prepareMovement(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        const { attributes, modifiers } = system;

        const movement = system.movement;
        // default movement: WALK = AGI * 2, RUN = AGI * 4
        movement.walk.base = attributes.agility.value * (2 + modifiers.walk);
        movement.run.base = attributes.agility.value * (4 + modifiers.run);

        Helpers.addChange(movement.walk, { name: "SR5.Bonus", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 2 });
        Helpers.addChange(movement.run, { name: "SR5.Bonus", mode: CONST.ACTIVE_EFFECT_MODES.MULTIPLY, value: 2 });

        Helpers.calcTotal(movement.walk, { min: 0 });
        Helpers.calcTotal(movement.run, { min: 0 });
    }
}
