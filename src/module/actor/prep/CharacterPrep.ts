import { PartsList } from './../../parts/PartsList';
import { RangedWeaponRules } from './../../rules/RangedWeaponRules';
import { InitiativePrep } from './functions/InitiativePrep';
import { ModifiersPrep } from './functions/ModifiersPrep';
import { MatrixPrep } from './functions/MatrixPrep';
import { ItemPrep } from './functions/ItemPrep';
import { SkillsPrep } from './functions/SkillsPrep';
import { LimitsPrep } from './functions/LimitsPrep';
import { MovementPrep } from './functions/MovementPrep';
import { WoundsPrep } from './functions/WoundsPrep';
import { AttributesPrep } from './functions/AttributesPrep';
import { NPCPrep } from './functions/NPCPrep';
import { SR5ItemDataWrapper } from "../../data/SR5ItemDataWrapper";
import { Helpers } from '../../helpers';
import { GruntPrep } from './functions/GruntPrep';
import { DataDefaults } from '../../data/DataDefaults';

export class CharacterPrep {
    static prepareBaseData(system: Shadowrun.CharacterData) {
        CharacterPrep.addSpecialAttributes(system);
        ModifiersPrep.prepareModifiers(system);
        ModifiersPrep.clearAttributeMods(system);
        ModifiersPrep.clearArmorMods(system);
        ModifiersPrep.clearLimitMods(system);
        ModifiersPrep.clearValueMods(system);
    }

    /**
     * All derived data should depend on basic values like Attributes or Skills.
     *
     * It shouldn't be modified by Active Effects, which instead should modify the global modifiers.
     *
     * @param system
     * @param items
     */
    static prepareDerivedData(system: Shadowrun.CharacterData, items: SR5ItemDataWrapper[]) {
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
    static prepareRecoil(system: Shadowrun.CharacterData | Shadowrun.CritterData | Shadowrun.SpiritData | Shadowrun.VehicleData) {
        Helpers.calcTotal(system.values.recoil, { min: 0 });
    }

    /**
     * Prepare the base actor recoil compensation without item influence.
     * 
     * @param system Character system data
     */
    static prepareRecoilCompensation(system: Shadowrun.CharacterData | Shadowrun.CritterData | Shadowrun.SpiritData) {
        const recoilCompensation = RangedWeaponRules.humanoidRecoilCompensationValue(system.attributes.strength.value);
        const baseRc = RangedWeaponRules.humanoidBaseRecoilCompensation();
        system.values.recoil_compensation.base = baseRc;
        PartsList.AddUniquePart(system.values.recoil_compensation.mod, 'SR5.RecoilCompensation', recoilCompensation);

        Helpers.calcTotal(system.values.recoil_compensation, { min: 0 });
    }

    static addSpecialAttributes(system: Shadowrun.CharacterData) {
        const { attributes } = system;

        // This is necessary to support critter actor types.
        attributes.initiation = DataDefaults.attributeData({ base: system.magic?.initiation ?? 0, label: "SR5.Initiation", hidden: true });;
        attributes.submersion = DataDefaults.attributeData({ base: system.technomancer?.submersion ?? 0, label: "SR5.Submersion", hidden: true });;
    }
}