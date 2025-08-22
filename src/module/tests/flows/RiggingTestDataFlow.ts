import { SuccessTest } from '@/module/tests/SuccessTest';
import { Helpers } from '@/module/helpers';
import { RiggingRules } from '@/module/rules/RiggingRules';
import { MatrixTestDataFlow } from '@/module/tests/flows/MatrixTestDataFlow';
import { PartsList } from '@/module/parts/PartsList';

export const RiggingTestDataFlow = {

    /**
     * Add modifiers to test for having a control rig
     * - mainly defined on SR5 pg266
     * @param test
     */
    addControlRigModifier: (test: SuccessTest) => {
        const vehicle = test.actor;
        if (!vehicle) return;
        if (!vehicle.isType('vehicle') || !vehicle.hasDriver() || !vehicle.isRiggerControlled()) return;
        const driver = vehicle.getVehicleDriver();
        if (!driver) return;
        const rating = driver.getControlRigRating();
        if (rating > 0) {
            // add the control rig rating as a limit bonus to tests
            test.data.limit.mod.push({name: 'SR5.ControlRig', value: rating});
            Helpers.calcTotal(test.data.limit);

            if (RiggingRules.isConsideredMatrixAction(test.data)) {
                MatrixTestDataFlow.addMatrixModifiersToPool(driver, new PartsList(test.data.pool.mod), true);
            }
        }
    }
}
