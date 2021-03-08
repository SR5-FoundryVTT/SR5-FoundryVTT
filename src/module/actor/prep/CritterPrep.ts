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
import {CharacterPrep} from "./CharacterPrep";

export class CritterPrep extends BaseActorPrep<SR5CritterType, CritterActorData> {
    prepare() {
        ModifiersPrep.prepareModifiers(this.data);
        ModifiersPrep.clearAttributeMods(this.data);

        ItemPrep.prepareArmor(this.data, this.items);
        ItemPrep.prepareBodyware(this.data, this.items);

        SkillsPrep.prepareSkills(this.data);
        AttributesPrep.prepareAttributes(this.data);
        LimitsPrep.prepareLimitBaseFromAttributes(this.data);
        LimitsPrep.prepareLimits(this.data);

        MatrixPrep.prepareMatrix(this.data, this.items);
        MatrixPrep.prepareMatrixToLimitsAndAttributes(this.data);

        ConditionMonitorsPrep.preparePhysical(this.data);
        ConditionMonitorsPrep.prepareStun(this.data);

        MovementPrep.prepareMovement(this.data);
        WoundsPrep.prepareWounds(this.data);

        InitiativePrep.prepareMeatspaceInit(this.data);
        InitiativePrep.prepareAstralInit(this.data);
        InitiativePrep.prepareMatrixInit(this.data);
        InitiativePrep.prepareCurrentInitiative(this.data);
    }
}
