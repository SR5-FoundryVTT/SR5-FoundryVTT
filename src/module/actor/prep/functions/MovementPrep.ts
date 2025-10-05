import { PartsList } from "@/module/parts/PartsList";

export class MovementPrep {
    static prepareMovement(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        const { attributes, modifiers } = system;

        const movement = system.movement;
        // default movement: WALK = AGI * 2, RUN = AGI * 4
        movement.walk.base = attributes.agility.value * (2 + modifiers.walk);
        movement.run.base = attributes.agility.value * (4 + modifiers.run);

        PartsList.addUniquePart(movement.walk, "SR5.Bonus", 2, CONST.ACTIVE_EFFECT_MODES.MULTIPLY);
        PartsList.addUniquePart(movement.run, "SR5.Bonus", 2, CONST.ACTIVE_EFFECT_MODES.MULTIPLY);

        PartsList.calcTotal(movement.walk, { min: 0 });
        PartsList.calcTotal(movement.run, { min: 0 });
    }
}
