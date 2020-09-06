import SR5ActorData = Shadowrun.SR5ActorData;
import TwoTrackActorData = Shadowrun.TwoTrackActorData;
import WoundsActorData = Shadowrun.WoundsActorData;

export class WoundsPrep {
    static prepareWounds(data: SR5ActorData & TwoTrackActorData & WoundsActorData) {
        const { modifiers, track } = data;
        const count = 3 + Number(modifiers['wound_tolerance']);
        const stunWounds = Math.floor(data.track.stun.value / count);
        const physicalWounds = Math.floor(data.track.physical.value / count);

        track.stun.wounds = stunWounds;
        track.physical.wounds = physicalWounds;

        data.wounds = {
            value: stunWounds + physicalWounds,
        };
    }
}
