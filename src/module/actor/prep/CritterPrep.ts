import { CharacterPrep } from './CharacterPrep';
import {InitiativePrep} from './functions/InitiativePrep';
import {MatrixPrep} from './functions/MatrixPrep';
import {ItemPrep} from './functions/ItemPrep';
import {SkillsPrep} from './functions/SkillsPrep';
import {LimitsPrep} from './functions/LimitsPrep';
import {MovementPrep} from './functions/MovementPrep';
import {WoundsPrep} from './functions/WoundsPrep';
import {AttributesPrep} from './functions/AttributesPrep';
import { GruntPrep } from './functions/GruntPrep';
import { SR5Item } from 'src/module/item/SR5Item';
import { ModifiableFieldPrep } from './functions/ModifiableFieldPrep';


export class CritterPrep {
    static prepareBaseData(system: Actor.SystemOfType<'critter'>) {
        ModifiableFieldPrep.resetAllModifiers(system);
    }

    static prepareDerivedData(system: Actor.SystemOfType<'critter'>, items: SR5Item[]) {
        AttributesPrep.prepareAttributes(system);
        AttributesPrep.prepareEssence(system, items);

        SkillsPrep.prepareSkills(system);

        ItemPrep.prepareArmor(system, items);

        MatrixPrep.prepareMatrix(system, items);
        MatrixPrep.prepareMatrixToLimitsAndAttributes(system);

        // Limits depend on attributes and active effects.
        LimitsPrep.prepareLimitBaseFromAttributes(system);
        LimitsPrep.prepareLimits(system);
        LimitsPrep.prepareDerivedLimits(system);

        GruntPrep.prepareConditionMonitors(system);

        MovementPrep.prepareMovement(system);
        WoundsPrep.prepareWounds(system);

        InitiativePrep.prepareMeatspaceInit(system);
        InitiativePrep.prepareAstralInit(system);
        InitiativePrep.prepareMatrixInit(system);
        InitiativePrep.prepareCurrentInitiative(system);

        CharacterPrep.prepareRecoil(system);
        CharacterPrep.prepareRecoilCompensation(system);
    }
}
