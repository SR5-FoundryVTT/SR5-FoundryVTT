import MovementActorData = Shadowrun.MovementActorData;
import ActorTypesData = Shadowrun.ShadowrunActorDataData;
import {PartsList} from "../../../parts/PartsList";

export class MovementPrep {
    static prepareMovement(system: ActorTypesData & MovementActorData) {
        const { attributes, modifiers } = system;

        const movement = system.movement;
        // default movement: WALK = AGI * 2, RUN = AGI * 4
        movement.walk.value = attributes.agility.value * (2 + Number(modifiers['walk'])) + new PartsList(movement.walk.mod).total;
        movement.run.value = attributes.agility.value * (4 + Number(modifiers['run'])) + new PartsList(movement.run.mod).total;
    }
}
