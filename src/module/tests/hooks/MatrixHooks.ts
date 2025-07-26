import { MatrixFlow } from '../../flows/MatrixFlow';
import { MatrixTestDataFlow } from '../flows/MatrixTestDataFlow';
import { SuccessTest } from '../SuccessTest';

/**
 * Matrix related Success Test hook implementations.
 */
export const MatrixHooks = {
    registerHooks: function () {
        Hooks.on('sr5_testPrepareBaseValues', MatrixHooks.onTestPrepareBaseValues_AddMatrixModifiers.bind(this));
        Hooks.on('sr5_testProcessResults', MatrixHooks.onTestProcessResults_AddMatrixDamageForTargetMarks.bind(this));
        Hooks.on('sr5_testProcessResults', MatrixHooks.onTestProcessResults_AddOverwatchScore.bind(this));
        Hooks.on('sr5_afterTestComplete', MatrixHooks.onAfterTestComplete_HandleMatrixDamage.bind(this));
    },

    /**
     * After a test has been prepared fully (including categories), extend it's data with matrix modifiers.
     * 
     * Hook into prepareBaseValues as it's called both on initial calculation and when updating test values during dialog changes.
     */
    onTestPrepareBaseValues_AddMatrixModifiers: function(test: SuccessTest) {
        MatrixTestDataFlow.addMatrixModifiers(test);
    },

    /**
     * After a test has been prepared fully (including categories), extend it's data with matrix modifiers.
     *
     * Hook into prepareBaseValues as it's called both on initial calculation and when updating test values during dialog changes.
     */
    onTestProcessResults_AddMatrixDamageForTargetMarks: function(test: SuccessTest) {
        MatrixTestDataFlow.addMatrixDamageForTargetMarks(test);
    },

    /**
     * After a test has been executed, determine if it's an opposing matrix test and should add overwatch score.
     * @param test 
     */
    onTestProcessResults_AddOverwatchScore: async function(test: SuccessTest) {
        await MatrixFlow.addOverwatchScoreFromIllegalMatrixAction(test);
    },

    /**
     * After a test has been executed, determine if there's any damage to be applied
     * - this also handles the automatic 1 damage that you get from ATTACK based actions SR 231
     * @param test
     */
    onAfterTestComplete_HandleMatrixDamage: async function(test: SuccessTest) {
        await MatrixFlow.determineMatrixFailedAttack(test);
    },
}
