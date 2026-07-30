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
     * Add modifiers to test for having a control rig
     * - mainly defined on SR5 pg266, more explained on SR5 pg 452
     * @param test
     */
    addControlRigModifier: (test: SuccessTest) => {
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
    },

    /**
     * Resolve and add Autosoft dice pool modifier for autonomous drone actions.
     */
    addAutosoftModifier: (test: SuccessTest) => {
        const vehicle = test.actor?.asType('vehicle');
        if (!vehicle) return;
        // Autosofts apply when drone is running on autopilot
        if (vehicle.system.controlMode !== 'autopilot') return;

        const actionSkill = test.data.action?.skill || '';
        let autosoftType = '';

        if (actionSkill === 'perception') autosoftType = 'clearsight';
        else if (actionSkill === 'sneaking') autosoftType = 'stealth';
        else if (actionSkill === 'gunnery') autosoftType = 'targeting';
        else if (actionSkill === 'electronic_warfare') autosoftType = 'electronic_warfare';
        else if (actionSkill.startsWith('pilot_')) autosoftType = 'maneuvering';
        else if (test.data.categories?.includes('defense')) autosoftType = 'evasion';

        if (!autosoftType) return;

        const autosoft = RiggingRules.getEffectiveAutosoft(vehicle, autosoftType);
        if (autosoft.rating > 0) {
            const label = autosoft.name || game.i18n.localize('SR5.Autosoft');
            ModifiableValue.addUnique(test.data.pool, label, autosoft.rating);
            ModifiableValue.calcTotal(test.data.pool);
        }
    },

    /**
     * Add Drone Swarm Pilot bonus to autonomous drone dice pools.
     */
    addSwarmModifier: (test: SuccessTest) => {
        const vehicle = test.actor?.asType('vehicle');
        if (!vehicle) return;

        const swarmInfo = RiggingRules.getSwarmPilotInfo(vehicle);
        if (swarmInfo.bonus > 0) {
            ModifiableValue.addUnique(test.data.pool, game.i18n.localize('SR5.SwarmBonus'), swarmInfo.bonus);
            ModifiableValue.calcTotal(test.data.pool);
        }
    },
}
