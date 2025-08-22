import { SuccessTest } from '@/module/tests/SuccessTest';
import { Helpers } from '@/module/helpers';
import { RiggingRules } from '@/module/rules/RiggingRules';
import { MatrixTestDataFlow } from '@/module/tests/flows/MatrixTestDataFlow';
import { PartsList } from '@/module/parts/PartsList';
import { AttributeRules } from '@/module/rules/AttributeRules';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { ActionRollType } from '@/module/types/item/Action';

export const RiggingTestDataFlow = {

    /**
     * Add modifiers to test for having a control rig
     * - mainly defined on SR5 pg266
     * @param test
     */
    addControlRigModifier: (test: SuccessTest) => {
        const vehicle = test.actor;
        if (!vehicle || !vehicle.isControlledByDriver('rigger')) return;
        const driver = vehicle.getVehicleDriver();
        if (!driver) return;
        const rating = driver.getControlRigRating();
        if (rating > 0) {
            // add the control rig rating as a limit bonus to tests
            test.data.limit.mod.push({name: game.i18n.localize('SR5.ControlRig'), value: rating});
            Helpers.calcTotal(test.data.limit);

            if (RiggingRules.isConsideredMatrixAction(test.data)) {
                MatrixTestDataFlow.addMatrixModifiersToPool(driver, new PartsList(test.data.pool.mod), true);
            }
        }
    },

    /**
     * Replace the attributes used in an action to use the Mental attribute equivalent
     * - this test verifies the actor in the roll is a vehicle being controlled remote or rigger
     * @param action
     * @param document
     */
    replacePhysicalAttributesForMentalDriver: (action: ActionRollType, document?: SR5Actor|SR5Item) => {
        if (!document) return;
        const actor = document instanceof SR5Actor ? document : document.actorOwner;
        if (!actor || !actor.isControlledByDriver('rigger', 'remote')) return;
        AttributeRules.replacePhysicalAttributesWithMentalAttributes(action);
    },
}
