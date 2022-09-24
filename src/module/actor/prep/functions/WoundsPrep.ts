import TwoTrackActorData = Shadowrun.TwoTrackActorData;
import WoundsActorData = Shadowrun.WoundsActorData;
import ActorTypesData = Shadowrun.ShadowrunActorDataData;

export class WoundsPrep {
    static prepareWounds(system: ActorTypesData & TwoTrackActorData & WoundsActorData) {
        const { modifiers, track } = system;
        const count = 3 + Number(modifiers['wound_tolerance']);
        const stunWounds = track.stun.disabled ? 0 : Math.floor(track.stun.value / count);
        const physicalWounds = track.physical.disabled ? 0 : Math.floor(track.physical.value / count);

        track.stun.wounds = stunWounds;
        track.physical.wounds = physicalWounds;

        system.wounds = {
            value: stunWounds + physicalWounds,
        };
    }
}
