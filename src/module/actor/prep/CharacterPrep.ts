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
import { GruntPrep } from './functions/GruntPrep';
import { DataDefaults } from '../../data/DataDefaults';
import { SR5Item } from 'src/module/item/SR5Item';
import { ModifiableFieldPrep } from './functions/ModifiableFieldPrep';
import { ModifiableValue } from '@/module/mods/ModifiableValue';

export class CharacterPrep {
    /**
     * Prepare base values that should be done before applying ActiveEffect changes.
     */
    static prepareBaseData(system: Actor.SystemOfType<'character'>) {
        ModifiableFieldPrep.resetAllModifiers(system);
        CharacterPrep.addSpecialAttributes(system);
    }

    /**
     * All derived data should depend on basic values like Attributes or Skills.
     *
     * ActiveEffect changes have applied before hand and only actor modifier values are 
     * left to apply additionally.
     *
     * @param system
     * @param items
     */
    static prepareDerivedData(system: Actor.SystemOfType<'character'>, items: SR5Item[]) {
        // Character attribute bases are authored data (importers/sheet), never rewritten by preparation, so
        // they anchor on the persisted `_source` value rather than the prepared `base` field.
        AttributesPrep.prepareAttributes(system, undefined, undefined, true);
        AttributesPrep.prepareEssence(system, items);

        // NPC metatype modifiers are attribute inputs and therefore must resolve before the
        // native attribute phase. Native effects then apply to the completed values below.
        NPCPrep.prepareNPCData(system);

        // Attribute ActiveEffects apply after all attribute inputs and before their consumers.
        system.parent?.applyActiveEffects('attributes');
        AttributesPrep.clampAttributesToRange(system);

        SkillsPrep.prepareSkills(system);

        ItemPrep.prepareArmor(system, items);

        MatrixPrep.prepareMatrix(system, items);
        system.parent?.applyActiveEffects('matrix');
        MatrixPrep.prepareMatrixToLimitsAndAttributes(system, true);

        // Limits depend on attributes and active effects.
        LimitsPrep.prepareLimitBaseFromAttributes(system);
        LimitsPrep.prepareLimits(system);
        LimitsPrep.prepareDerivedLimits(system);

        GruntPrep.prepareConditionMonitors(system);

        MovementPrep.prepareMovement(system);
        WoundsPrep.prepareWounds(system);

        InitiativePrep.prepareInit('character', system);

        CharacterPrep.prepareRecoil(system);
        CharacterPrep.prepareRecoilCompensation(system);
        ModifiableValue.applyChanges(system.values.control_rig_rating);

        // Derived ActiveEffects apply after their local value producers have completed.
        system.parent?.applyActiveEffects('derived');
    }

    /**
     * Prepare the current progressive recoil of an actor.
     * 
     * @param system Physical humanoid system data.
     */
    static prepareRecoil(system: Actor.SystemOfType<'character' | 'spirit' | 'vehicle'>) {
        ModifiableValue.applyChanges(system.values.recoil, { min: 0 });
    }

    /**
     * Prepare the base actor recoil compensation without item influence.
     * 
     * @param system Character system data
     */
    static prepareRecoilCompensation(system: Actor.SystemOfType<'character' | 'spirit'>) {
        const recoilCompensation = RangedWeaponRules.humanoidRecoilCompensationValue(system.attributes.strength.value);
        const baseRc = RangedWeaponRules.humanoidBaseRecoilCompensation();

        // Derived anchor logged as a BASE_PRIORITY entry instead of the `base` field, then folded from 0.
        const mod = new ModifiableValue(system.values.recoil_compensation);
        mod.addUniqueBase('SR5.BaseValue', baseRc);
        mod.addUnique("SR5.RecoilCompensation", recoilCompensation);
        mod.applyChanges({ from: 0, min: 0 });
    }

    static addSpecialAttributes(system: Actor.SystemOfType<'character'>) {
        const { attributes } = system;

        // This is necessary to support critter actor types. Should we keep it?
        attributes.initiation = DataDefaults.createData('attribute_field', { base: system.magic.initiation, label: "SR5.Initiation", hidden: true });;
        attributes.submersion = DataDefaults.createData('attribute_field', { base: system.technomancer.submersion, label: "SR5.Submersion", hidden: true });;
    }
}
