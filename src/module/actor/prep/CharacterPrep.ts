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

export function CharacterDataPrepare(data: CharacterData, items: SR5ItemDataWrapper[]) {
    ModifiersPrep.prepareModifiers(data);
    ModifiersPrep.clearAttributeMods(data);

    ItemPrep.prepareArmor(data, items);
    ItemPrep.prepareBodyware(data, items);

    SkillsPrep.prepareSkills(data);
    AttributesPrep.prepareAttributes(data);

    // NPCPrep is reliant to be called after AttributesPrep.
    NPCPrep.prepareNPCData(data);

    LimitsPrep.prepareLimitBaseFromAttributes(data);
    LimitsPrep.prepareLimits(data);

    MatrixPrep.prepareMatrix(data, items);
    MatrixPrep.prepareMatrixToLimitsAndAttributes(data);

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
