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
    static prepareBaseData(system: CharacterData) {
        ModifiersPrep.prepareModifiers(system);
        ModifiersPrep.clearAttributeMods(system);
        ModifiersPrep.clearArmorMods(system);
        ModifiersPrep.clearLimitMods(system);
    }

    /**
     * All derived data should depend on basic values like Attributes or Skills.
     *
     * It shouldn't be modified by Active Effects, which instead should modify the global modifiers.
     *
     * @param system
     * @param items
     */
    static prepareDerivedData(system: CharacterData, items: SR5ItemDataWrapper[]) {
        AttributesPrep.prepareAttributes(system);
        // NPCPrep is reliant to be called after AttributesPrep.
        NPCPrep.prepareNPCData(system);

        SkillsPrep.prepareSkills(system);

        ItemPrep.prepareArmor(system, items);
        ItemPrep.prepareBodyware(system, items);

        MatrixPrep.prepareMatrix(system, items);
        MatrixPrep.prepareMatrixToLimitsAndAttributes(system);

        // Limits depend on attributes and active effects.
        LimitsPrep.prepareLimitBaseFromAttributes(system);
        LimitsPrep.prepareLimits(system);

        if (system.is_npc && system.npc.is_grunt) {
            ConditionMonitorsPrep.prepareGrunt(system);
        } else {
            ConditionMonitorsPrep.preparePhysical(system);
            ConditionMonitorsPrep.prepareStun(system);
        }

        MovementPrep.prepareMovement(system);
        WoundsPrep.prepareWounds(system);

        InitiativePrep.prepareMeatspaceInit(system);
        InitiativePrep.prepareAstralInit(system);
        InitiativePrep.prepareMatrixInit(system);
        InitiativePrep.prepareCurrentInitiative(system);
    }
}