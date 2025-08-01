import { Helpers } from "@/module/helpers";
import {PartsList} from "../../../parts/PartsList";

export class MovementPrep {
    static prepareMovement(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        const { attributes, modifiers } = system;

        const movement = system.movement;
        // default movement: WALK = AGI * 2, RUN = AGI * 4
        movement.walk.base = attributes.agility.value * (2 + Number(modifiers['walk'])) + new PartsList(movement.walk.mod).total;
        movement.run.base = attributes.agility.value * (4 + Number(modifiers['run'])) + new PartsList(movement.run.mod).total;

        Helpers.calcTotal(movement.walk, {min: 0});
        Helpers.calcTotal(movement.run, {min: 0});
    }
}
