import {InitiativePrep} from './functions/InitiativePrep';
import {ModifiersPrep} from './functions/ModifiersPrep';
import {MatrixPrep} from './functions/MatrixPrep';
import {ItemPrep} from './functions/ItemPrep';
import {SkillsPrep} from './functions/SkillsPrep';
import {LimitsPrep} from './functions/LimitsPrep';
import {ConditionMonitorsPrep} from './functions/ConditionMonitorsPrep';
import {MovementPrep} from './functions/MovementPrep';
import {WoundsPrep} from './functions/WoundsPrep';
import {AttributesPrep} from './functions/AttributesPrep';
import {SR5ItemDataWrapper} from "../../data/SR5ItemDataWrapper";
import CritterData = Shadowrun.CritterData;


export class CritterPrep {
    static prepareBaseData(data: CritterData) {
        ModifiersPrep.prepareModifiers(data);
        ModifiersPrep.clearAttributeMods(data);
        ModifiersPrep.clearArmorMods(data);
        ModifiersPrep.clearLimitMods(data);
    }

    static prepareDerivedData(data: CritterData, items: SR5ItemDataWrapper[]) {
        AttributesPrep.prepareAttributes(data);
        SkillsPrep.prepareSkills(data);

        ItemPrep.prepareArmor(data, items);
        ItemPrep.prepareBodyware(data, items);

        MatrixPrep.prepareMatrix(data, items);
        MatrixPrep.prepareMatrixToLimitsAndAttributes(data);

        // Limits depend on attributes and active effects.
        LimitsPrep.prepareLimitBaseFromAttributes(data);
        LimitsPrep.prepareLimits(data);

        ConditionMonitorsPrep.preparePhysical(data);
        ConditionMonitorsPrep.prepareStun(data);

        MovementPrep.prepareMovement(data);
        WoundsPrep.prepareWounds(data);

        InitiativePrep.prepareMeatspaceInit(data);
        InitiativePrep.prepareAstralInit(data);
        InitiativePrep.prepareMatrixInit(data);
        InitiativePrep.prepareCurrentInitiative(data);
    }
}