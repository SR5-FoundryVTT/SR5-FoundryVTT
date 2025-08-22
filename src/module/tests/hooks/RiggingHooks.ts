import { SuccessTest } from '@/module/tests/SuccessTest';
import { RiggingTestDataFlow } from '@/module/tests/flows/RiggingTestDataFlow';

export const RiggingHooks = {
    registerHooks: () => {
        Hooks.on('sr5_testPrepareBaseValues', RiggingHooks.onTestPrepareBaseValues_AddControlRigModifier.bind(this));
    },

    onTestPrepareBaseValues_AddControlRigModifier: (test: SuccessTest) => {
        RiggingTestDataFlow.addControlRigModifier(test);
    },
}
