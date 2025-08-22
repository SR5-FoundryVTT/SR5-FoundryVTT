import { SuccessTest } from '@/module/tests/SuccessTest';
import { RiggingTestDataFlow } from '@/module/tests/flows/RiggingTestDataFlow';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { ActionRollType } from '@/module/types/item/Action';
import { SR5Item } from '@/module/item/SR5Item';

export const RiggingHooks = {
    registerHooks: () => {
        Hooks.on('sr5_testPrepareBaseValues', RiggingHooks.onTestPrepareBaseValues_AddControlRigModifier.bind(this));
        Hooks.on('sr5_testPrepareBaseValues', RiggingHooks.onTestPrepareBaseValues_AddMatrixModifier.bind(this));
        Hooks.on('sr5_beforePrepareTestDataWithAction', RiggingHooks.onBeforePrepareTestDataWithAction_ReplaceAttributesForMental.bind(this));
    },

    onTestPrepareBaseValues_AddControlRigModifier: (test: SuccessTest) => {
        RiggingTestDataFlow.addControlRigModifier(test);
    },

    onTestPrepareBaseValues_AddMatrixModifier: (test: SuccessTest) => {
        RiggingTestDataFlow.addMatrixModifier(test);
    },

    onBeforePrepareTestDataWithAction_ReplaceAttributesForMental: (action: ActionRollType, document: SR5Item|SR5Actor) => {
        RiggingTestDataFlow.replacePhysicalAttributesForMentalDriver(action, document);
    }
}
