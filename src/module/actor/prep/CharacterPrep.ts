import { BaseActorPrep } from './BaseActorPrep';
import SR5CharacterType = Shadowrun.SR5CharacterType;
import CharacterActorData = Shadowrun.CharacterActorData;
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

export class CharacterPrep extends BaseActorPrep<SR5CharacterType, CharacterActorData> {
    prepare() {
        ModifiersPrep.prepareModifiers(this.data);

        ItemPrep.prepareArmor(this.data, this.items);
        ItemPrep.prepareCyberware(this.data, this.items);

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
