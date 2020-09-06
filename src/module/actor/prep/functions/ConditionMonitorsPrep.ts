import SR5ActorData = Shadowrun.SR5ActorData;
import TwoTrackActorData = Shadowrun.TwoTrackActorData;

export class ConditionMonitorsPrep {
    static prepareStun(data: SR5ActorData & TwoTrackActorData) {
        const { track, attributes, modifiers } = data;

        track.stun.max = 8 + Math.ceil(attributes.willpower.value / 2) + Number(modifiers['stun_track']);
        track.stun.label = CONFIG.SR5.damageTypes.stun;
    }

    static preparePhysical(data: SR5ActorData & TwoTrackActorData) {
        const { track, attributes, modifiers } = data;

        track.physical.max = 8 + Math.ceil(attributes.body.value / 2) + Number(modifiers['physical_track']);
        track.physical.overflow.max = attributes.body.value;
        track.physical.label = CONFIG.SR5.damageTypes.physical;
    }
}
