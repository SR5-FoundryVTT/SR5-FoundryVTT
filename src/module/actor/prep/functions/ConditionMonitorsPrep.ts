import { SR5 } from "../../../config";

export class ConditionMonitorsPrep {
    static prepareStun(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        const { track, attributes, modifiers } = system;

        track.stun.base = 8 + Math.ceil(attributes.willpower.value / 2);
        track.stun.max = Math.max(1, track.stun.base + modifiers.stun_track);
        track.stun.label = SR5.damageTypes.stun;
        track.stun.disabled = false;
    }

    static preparePhysical(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        const { track, attributes, modifiers } = system;

        track.physical.base = 8 + Math.ceil(attributes.body.value / 2);
        track.physical.max = Math.max(1, track.physical.base + modifiers.physical_track);
        track.physical.overflow.max = attributes.body.value + modifiers.physical_overflow_track;
        track.physical.label = SR5.damageTypes.physical;
        track.physical.disabled = false;
    }

    static prepareGrunt(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        // Grunts use only one monitor, use physical to get overflow functionality.
        ConditionMonitorsPrep.prepareStun(system);

        const { track, attributes, modifiers } = system;
        // Overwrite stun damage to avoid invisible damage modifiers.
        track.stun.value = 0;
        track.stun.disabled = true;

        // Grunts use either their WIL or BOD as their monitors attribute.
        const attribute = attributes.willpower.value > attributes.body.value ?
            attributes.willpower:
            attributes.body;

        track.physical.base = 8 + Math.ceil(attribute.value / 2);
        track.physical.max = Math.max(1, track.physical.base + modifiers.physical_track);
        track.physical.overflow.max = attributes.body.value;
        track.physical.label = "SR5.ConditionMonitor";
        track.physical.disabled = false;
    }
}
