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
import CharacterData = Shadowrun.CharacterData;
import {SR5ItemDataWrapper} from "../../data/SR5ItemDataWrapper";

export class CharacterPrep {
    static prepareBaseData(data: CharacterData) {
        ModifiersPrep.prepareModifiers(data);
        ModifiersPrep.clearAttributeMods(data);
    }

    /**
     * All derived data should depend on basic values like Attributes or Skills.
     *
     * It shouldn't be modified by Active Effects, which instead should modify the global modifiers.
     *
     * @param data
     * @param items
     */
    static prepareDerivedData(data: CharacterData, items: SR5ItemDataWrapper[]) {
        AttributesPrep.prepareAttributes(data);
        // NPCPrep is reliant to be called after AttributesPrep.
        NPCPrep.prepareNPCData(data);

        SkillsPrep.prepareSkills(data);

        ItemPrep.prepareArmor(data, items);
        ItemPrep.prepareBodyware(data, items);

        MatrixPrep.prepareMatrix(data, items);
        MatrixPrep.prepareMatrixToLimitsAndAttributes(data);

        // Limits depend on attributes and active effects.
        LimitsPrep.prepareLimitBaseFromAttributes(data);
        LimitsPrep.prepareLimits(data);

        if (data.is_npc && data.npc.is_grunt) {
            ConditionMonitorsPrep.prepareGrunt(data);
        } else {
            ConditionMonitorsPrep.preparePhysical(data);
            ConditionMonitorsPrep.prepareStun(data);
        }

        MovementPrep.prepareMovement(data);
        WoundsPrep.prepareWounds(data);

        InitiativePrep.prepareMeatspaceInit(data);
        InitiativePrep.prepareAstralInit(data);
        InitiativePrep.prepareMatrixInit(data);
        InitiativePrep.prepareCurrentInitiative(data);
    }
}