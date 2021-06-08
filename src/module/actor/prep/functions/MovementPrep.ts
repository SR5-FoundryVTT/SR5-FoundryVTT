import MovementActorData = Shadowrun.MovementActorData;
import ActorTypesData = Shadowrun.ShadowrunActorDataData;

export class MovementPrep {
    static prepareMovement(data: ActorTypesData & MovementActorData) {
        const { attributes, modifiers } = data;
        const movement = data.movement;
        // default movement: WALK = AGI * 2, RUN = AGI * 4
        movement.walk.value = attributes.agility.value * (2 + Number(modifiers['walk']));
        movement.run.value = attributes.agility.value * (4 + Number(modifiers['run']));
    }
}
