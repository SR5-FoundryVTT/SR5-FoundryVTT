import { BaseActorPrep } from './BaseActorPrep';
import SR5VehicleType = Shadowrun.SR5VehicleType;
import VehicleActorData = Shadowrun.VehicleActorData;
import { SkillsPrep } from './functions/SkillsPrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { InitiativePrep } from './functions/InitiativePrep';
import { ItemPrep } from './functions/ItemPrep';
import { ConditionMonitorsPrep } from './functions/ConditionMonitorsPrep';
import { MovementPrep } from './functions/MovementPrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MatrixPrep } from './functions/MatrixPrep';

export class VehiclePrep extends BaseActorPrep<SR5VehicleType, VehicleActorData> {
    prepare() {
        ModifiersPrep.prepareModifiers(this.data);

        ItemPrep.prepareArmor(this.data, this.items);
        ItemPrep.prepareCyberware(this.data, this.items);

        SkillsPrep.prepareSkills(this.data);
        AttributesPrep.prepareAttributes(this.data);
        LimitsPrep.prepareLimits(this.data);

        MatrixPrep.prepareMatrix(this.data, this.items);
        MatrixPrep.prepareMatrixToLimitsAndAttributes(this.data);

        ConditionMonitorsPrep.preparePhysical(this.data);

        MovementPrep.prepareMovement(this.data);

        InitiativePrep.prepareMeatspaceInit(this.data);
        InitiativePrep.prepareMatrixInit(this.data);
        InitiativePrep.prepareCurrentInitiative(this.data);
    }
}
