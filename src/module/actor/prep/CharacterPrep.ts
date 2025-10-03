import { RangedWeaponRules } from './../../rules/RangedWeaponRules';
import { InitiativePrep } from './functions/InitiativePrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { ItemPrep } from './functions/ItemPrep';
import { SkillsPrep } from './functions/SkillsPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MovementPrep } from './functions/MovementPrep';
import { WoundsPrep } from './functions/WoundsPrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { NPCPrep } from './functions/NPCPrep';
import { Helpers } from '../../helpers';
import { GruntPrep } from './functions/GruntPrep';
import { DataDefaults } from '../../data/DataDefaults';
import { SR5Item } from 'src/module/item/SR5Item';
import { ModifiableFieldPrep } from './functions/ModifiableFieldPrep';

export class CharacterPrep {
    static prepareBaseData(system: Actor.SystemOfType<'character'>) {
        ModifiableFieldPrep.resetAllModifiers(system);
        CharacterPrep.addSpecialAttributes(system);
    }

    /**
     * All derived data should depend on basic values like Attributes or Skills.
     *
     * It shouldn't be modified by Active Effects, which instead should modify the global modifiers.
     *
     * @param system
     * @param items
     */
    static prepareDerivedData(system: Actor.SystemOfType<'character'>, items: SR5Item[]) {
        AttributesPrep.prepareAttributes(system);
        AttributesPrep.prepareEssence(system, items);

        // NPCPrep is reliant to be called after AttributesPrep.
        NPCPrep.prepareNPCData(system);

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

    /**
     * Prepare the current progressive recoil of an actor.
     * 
     * @param system Physical humanoid system data.
     */
    static prepareRecoil(system: Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'vehicle'>) {
        Helpers.calcTotal(system.values.recoil, { min: 0 });
    }

    /**
     * Prepare the base actor recoil compensation without item influence.
     * 
     * @param system Character system data
     */
    static prepareRecoilCompensation(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        const recoilCompensation = RangedWeaponRules.humanoidRecoilCompensationValue(system.attributes.strength.value);
        const baseRc = RangedWeaponRules.humanoidBaseRecoilCompensation();
        system.values.recoil_compensation.base = baseRc;
        Helpers.addChange(system.values.recoil_compensation, { name: "SR5.RecoilCompensation", value: recoilCompensation });

        Helpers.calcTotal(system.values.recoil_compensation, { min: 0 });
    }

    static addSpecialAttributes(system: Actor.SystemOfType<'character'>) {
        const { attributes } = system;

        // This is necessary to support critter actor types.
        attributes.initiation = DataDefaults.createData('attribute_field', { base: system.magic.initiation, label: "SR5.Initiation", hidden: true });;
        attributes.submersion = DataDefaults.createData('attribute_field', { base: system.technomancer.submersion, label: "SR5.Submersion", hidden: true });;
    }
}
