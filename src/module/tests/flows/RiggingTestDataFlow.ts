import { SuccessTest } from '@/module/tests/SuccessTest';
import { RiggingRules } from '@/module/rules/RiggingRules';
import { MatrixTestDataFlow } from '@/module/tests/flows/MatrixTestDataFlow';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { AttributeRules } from '@/module/rules/AttributeRules';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { ActionRollType } from '@/module/types/item/Action';
import { MonitorRules } from '@/module/rules/MonitorRules';

export const RiggingTestDataFlow = {

    /**
     * Apply Evasion autosoft rating to autonomous drone defense / sensor lock defense tests.
     * SR5 Core p. 269, p. 270 / Rigger 5.0 p. 127
     */
    addEvasionAutosoftModifier: (test: SuccessTest) => {
        const vehicle = test.actor?.asType('vehicle');
        if (!vehicle || vehicle.system.controlMode !== 'autopilot') return;

        const isSensorLockDefense = test.type === 'OpposedActiveSensorLockTest';
        const isOpposedVehicle = test.type === 'OpposedVehicleTest';
        const hasDefenseCategory = test.hasTestCategory('defense') || test.testCategories?.includes('defense');
        const isHandlingDefense = hasDefenseCategory && test.data.action?.limit?.attribute === 'handling';
        const isFullDefense = hasDefenseCategory && (test.data as any).activeDefense === 'full_defense';
        const isGeneralDefense = hasDefenseCategory && !test.data.action?.skill;

        if (!isSensorLockDefense && !isOpposedVehicle && !isHandlingDefense && !isFullDefense && !isGeneralDefense) return;

        const evasion = RiggingRules.getEffectiveAutosoft(vehicle, 'evasion');
        if (evasion.rating <= 0) return;

        if (!isSensorLockDefense && !isFullDefense && test.data.action?.skill) {
            const existingSkillRating = vehicle.findActiveSkill(test.data.action.skill)?.value || 0;
            if (existingSkillRating >= evasion.rating) return;
        }

        const label = evasion.name || game.i18n.localize('SR5.AutosoftTypes.Evasion');
        ModifiableValue.addUnique(test.data.pool, label, evasion.rating);
        ModifiableValue.calcTotal(test.data.pool);
    },

    /**
     * Add modifiers to test for having a control rig
     * - mainly defined on SR5 pg266, more explained on SR5 pg 452
     * @param test
     */
    addControlRigModifier: (test: SuccessTest) => {
        RiggingTestDataFlow.addEvasionAutosoftModifier(test);
        const vehicle = test.actor?.asType('vehicle');
        if (!vehicle?.isControlledByDriver('rigger')) return;
        const driver = vehicle.getVehicleDriver();
        if (!driver) return;
        const rating = driver.getControlRigRating();
        // if the rating is greater than 0 and a limit is already in place, add the control rig
        if (rating > 0 && test.data.limit.value > 0) {
            // add the control rig rating as a limit bonus to tests
            ModifiableValue.addUnique(test.data.limit, game.i18n.localize('SR5.ControlRig'), rating);
            ModifiableValue.calcTotal(test.data.limit);
            // SR5 pg 452 says you add the control rig rating to vehicle tests
            ModifiableValue.addUnique(test.data.pool, game.i18n.localize('SR5.ControlRig'), rating);
            ModifiableValue.calcTotal(test.data.pool);
        }
    },

    /**
     * Add Matrix Modifiers to a test that is being done by a Rigger in a Vehicle (Jumped In)
     * @param test
     */
    addMatrixModifier: (test: SuccessTest) => {
        const vehicle = test.actor?.asType('vehicle');
        if (!vehicle?.isControlledByDriver('rigger')) return;
        const driver = vehicle.getVehicleDriver();
        if (!driver) return;
        if (RiggingRules.isConsideredMatrixAction(test.data)) {
            MatrixTestDataFlow.addMatrixModifiersToPool(driver, new ModifiableValue(test.data.pool), true);
        }
    },

    /**
     * Apply vehicle damage penalties to handling-based limits on roll data only.
     */
    addVehicleHandlingDamageModifier: (test: SuccessTest) => {
        const vehicle = test.actor?.asType('vehicle');
        if (!vehicle) return;
        if (test.data.action.limit.attribute !== 'handling') return;
        if (test.data.limit.value <= 0) return;

        const { modifiers, track } = vehicle.system;

        if (track.physical.disabled) return;

        const woundBoxesThreshold = MonitorRules.woundModifierBoxesThreshold(modifiers.wound_tolerance);
        const wounds = MonitorRules.wounds(track.physical.value, woundBoxesThreshold, modifiers.pain_tolerance_physical);
        const woundModifier = Math.max(1 - test.data.limit.value, MonitorRules.woundModifier(wounds));

        ModifiableValue.setUnique(test.data.limit, 'SR5.Vehicle.DamagedVehicle', woundModifier);
    },

    /**
     * Replace physical attributes with mental attributes for rigger/remote driver
     */
    replacePhysicalAttributesForMentalDriver: (action: ActionRollType, document?: SR5Actor|SR5Item) => {
        if (!document) return;
        const actor = document instanceof SR5Actor ? document : document.actorOwner;
        if (!actor?.isControlledByDriver('rigger', 'remote')) return;
        AttributeRules.replacePhysicalAttributesWithMentalAttributes(action);
    }
}

