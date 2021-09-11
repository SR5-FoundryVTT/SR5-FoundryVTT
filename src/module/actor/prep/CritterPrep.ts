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
import CritterData = Shadowrun.CritterData;
import {SR5ItemDataWrapper} from "../../data/SR5ItemDataWrapper";

export function CritterPrepareDerivedData(data: CritterData, items: SR5ItemDataWrapper[]) {
    ModifiersPrep.prepareModifiers(data);
    ModifiersPrep.clearAttributeMods(data);

    ItemPrep.prepareArmor(data, items);
    ItemPrep.prepareBodyware(data, items);

    SkillsPrep.prepareSkills(data);
    AttributesPrep.prepareAttributes(data);
    LimitsPrep.prepareLimitBaseFromAttributes(data);
    LimitsPrep.prepareLimits(data);

    MatrixPrep.prepareMatrix(data, items);
    MatrixPrep.prepareMatrixToLimitsAndAttributes(data);

    ConditionMonitorsPrep.preparePhysical(data);
    ConditionMonitorsPrep.prepareStun(data);

    MovementPrep.prepareMovement(data);
    WoundsPrep.prepareWounds(data);

    InitiativePrep.prepareMeatspaceInit(data);
    InitiativePrep.prepareAstralInit(data);
    InitiativePrep.prepareMatrixInit(data);
    InitiativePrep.prepareCurrentInitiative(data);
}