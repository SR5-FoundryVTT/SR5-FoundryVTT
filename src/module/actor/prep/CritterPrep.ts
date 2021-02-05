import { BaseActorPrep } from './BaseActorPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { ItemPrep } from './functions/ItemPrep';
import { SkillsPrep } from './functions/SkillsPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { ConditionMonitorsPrep } from './functions/ConditionMonitorsPrep';
import { MovementPrep } from './functions/MovementPrep';
import { WoundsPrep } from './functions/WoundsPrep';
import { AttributesPrep } from './functions/AttributesPrep';
import SR5CritterType = Shadowrun.SR5CritterType;
import CritterActorData = Shadowrun.CritterActorData;
import SR5ActorData = Shadowrun.SR5ActorData;
import TwoTrackActorData = Shadowrun.TwoTrackActorData;

export class CritterPrep extends BaseActorPrep<SR5CritterType, CritterActorData> {
    prepare() {
        ModifiersPrep.prepareModifiers(this.data);
        ModifiersPrep.clearAttributeMods(this.data);

        ItemPrep.prepareArmor(this.data, this.items);

        SkillsPrep.prepareSkills(this.data);
        AttributesPrep.prepareAttributes(this.data);
        LimitsPrep.prepareLimitBaseFromAttributes(this.data);
        LimitsPrep.prepareLimits(this.data);

        MatrixPrep.prepareMatrix(this.data, this.items);
        MatrixPrep.prepareMatrixToLimitsAndAttributes(this.data);

        CritterPrep.prepareMonitors(this.data);

        MovementPrep.prepareMovement(this.data);
        WoundsPrep.prepareWounds(this.data);

        InitiativePrep.prepareMeatspaceInit(this.data);
        InitiativePrep.prepareAstralInit(this.data);
        InitiativePrep.prepareMatrixInit(this.data);
        InitiativePrep.prepareCurrentInitiative(this.data);

    }

    /** Critters use static monitors without any calculation.
     * NOTE: As a workaround use only global modifiers to define track.
     */
    static prepareMonitors(data: CritterActorData & TwoTrackActorData) {

        const {track, modifiers} = data;

        track.stun.max = Number(modifiers['stun_track']);
        track.stun.label = CONFIG.SR5.damageTypes.physical;
        track.stun.disabled = false;

        track.physical.max = Number(modifiers['physical_track']);
        track.physical.overflow.max = 0;
        track.physical.label = CONFIG.SR5.damageTypes.physical;
        track.physical.disabled = false;
    }
}
