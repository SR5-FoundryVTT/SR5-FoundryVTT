import { SuccessTest } from '@/module/tests/SuccessTest';
import { RiggingTestDataFlow } from '@/module/tests/flows/RiggingTestDataFlow';
import { RiggerActionFlows } from '@/module/flows/RiggerActionFlows';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { ActionRollType } from '@/module/types/item/Action';
import { SR5Item } from '@/module/item/SR5Item';

export const RiggingHooks = {
    registerHooks: () => {
        Hooks.on('sr5_testPrepareBaseValues', RiggingHooks.onTestPrepareBaseValues_AddControlRigModifier.bind(this));
        Hooks.on('sr5_testPrepareBaseValues', RiggingHooks.onTestPrepareBaseValues_AddMatrixModifier.bind(this));
        Hooks.on('sr5_testPrepareBaseValues', RiggingHooks.onTestPrepareBaseValues_AddVehicleHandlingDamageModifier.bind(this));
        Hooks.on('sr5_beforePrepareTestDataWithAction', RiggingHooks.onBeforePrepareTestDataWithAction_ReplaceAttributesForMental.bind(this));
        Hooks.on('sr5_afterTestComplete', RiggingHooks.onAfterTestComplete_ProcessRiggerActionOutcomes.bind(this));
    },

    onTestPrepareBaseValues_AddControlRigModifier: (test: SuccessTest) => {
        RiggingTestDataFlow.addControlRigModifier(test);
    },

    onTestPrepareBaseValues_AddMatrixModifier: (test: SuccessTest) => {
        RiggingTestDataFlow.addMatrixModifier(test);
    },

    onTestPrepareBaseValues_AddVehicleHandlingDamageModifier: (test: SuccessTest) => {
        RiggingTestDataFlow.addVehicleHandlingDamageModifier(test);
    },

    onBeforePrepareTestDataWithAction_ReplaceAttributesForMental: (action: ActionRollType, document: SR5Item|SR5Actor) => {
        RiggingTestDataFlow.replacePhysicalAttributesForMentalDriver(action, document);
    },

    onAfterTestComplete_ProcessRiggerActionOutcomes: async (test: SuccessTest) => {
        await RiggerActionFlows.processTestOutcome(test);
    }
}

