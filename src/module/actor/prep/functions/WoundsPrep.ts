import { MonitorRules } from './../../../rules/MonitorRules';
import TwoTrackActorData = Shadowrun.TwoTrackActorData;
import WoundsActorData = Shadowrun.WoundsActorData;
import ActorTypesData = Shadowrun.ShadowrunActorDataData;

export class WoundsPrep {
    static prepareWounds(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        const { modifiers, track } = system;

        // The actor overall has a wound tolerance.
        const damageTolerance = modifiers.wound_tolerance;
        const woundBoxesThreshold = MonitorRules.woundModifierBoxesThreshold(damageTolerance);

        // Each track defines it's local pain tolerance.
        track.stun.pain_tolerance = Number(modifiers['pain_tolerance_stun']);
        track.physical.pain_tolerance = Number(modifiers['pain_tolerance_physical']);

        // Legacy system provides a way of disabling a track, which will always return no wounds
        const stunWounds = track.stun.disabled ? 0 : MonitorRules.wounds(track.stun.value, woundBoxesThreshold, track.stun.pain_tolerance);
        const physicalWounds = track.physical.disabled ? 0 : MonitorRules.wounds(track.physical.value, woundBoxesThreshold, track.physical.pain_tolerance);

        // Each track defines it's local wounds
        track.stun.wounds = stunWounds;
        track.physical.wounds = physicalWounds;

        // The actor as a whole derives these wounds for wound modifier calculation
        system.wounds = {
            value: stunWounds + physicalWounds,
        };
    }
}
