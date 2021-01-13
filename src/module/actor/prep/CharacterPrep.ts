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
import { NPCPrep } from './functions/NPCPrep';
import SR5CharacterType = Shadowrun.SR5CharacterType;
import CharacterActorData = Shadowrun.CharacterActorData;

export class CharacterPrep extends BaseActorPrep<SR5CharacterType, CharacterActorData> {
    prepare() {
        ModifiersPrep.prepareModifiers(this.data);
        ModifiersPrep.clearAttributeMods(this.data);

        ItemPrep.prepareArmor(this.data, this.items);
        ItemPrep.prepareBodyware(this.data, this.items);

        SkillsPrep.prepareSkills(this.data);
        AttributesPrep.prepareAttributes(this.data);

        // NPCPrep is reliant to be called after AttributesPrep.
        NPCPrep.prepareNPCData(this.data);

        LimitsPrep.prepareLimitBaseFromAttributes(this.data);
        LimitsPrep.prepareLimits(this.data);

        MatrixPrep.prepareMatrix(this.data, this.items);
        MatrixPrep.prepareMatrixToLimitsAndAttributes(this.data);

        if (this.data.is_npc && this.data.npc.is_grunt) {
            ConditionMonitorsPrep.prepareGrunt(this.data);
        } else {
            ConditionMonitorsPrep.preparePhysical(this.data);
            ConditionMonitorsPrep.prepareStun(this.data);
        }

        MovementPrep.prepareMovement(this.data);
        WoundsPrep.prepareWounds(this.data);

        InitiativePrep.prepareMeatspaceInit(this.data);
        InitiativePrep.prepareAstralInit(this.data);
        InitiativePrep.prepareMatrixInit(this.data);
        InitiativePrep.prepareCurrentInitiative(this.data);


    }
}
