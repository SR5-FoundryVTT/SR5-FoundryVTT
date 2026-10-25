import type { SuccessTest } from "./SuccessTest";

/**
 * The stages every test execution passes, in order. Each fires the sr5_testStage hook once done.
 */
export const TEST_PIPELINE_STAGES = ['prepare', 'check', 'dialog', 'consume', 'roll', 'process', 'message', 'complete'] as const;
export type TestPipelineStage = typeof TEST_PIPELINE_STAGES[number];

/**
 * How a test execution differs from a first, normal roll.
 *
 * SuccessTest.run executes the pipeline stages, a mode only steers the stages that differ.
 */
export interface TestMode {
    id: string;
    /** Can the test be executed in this mode at all? Called before anything else. */
    allowed?(test: SuccessTest): boolean;
    /** Load what the execution needs. A normal roll prepares everything, a reroll only its documents. */
    prepare(test: SuccessTest): Promise<void>;
    /** Edge rules need an actor to spend Edge from. */
    requiresActor?: boolean;
    /** Change the test right before the dialog, or before consuming for modes without a dialog. */
    beforeDialog?(test: SuccessTest): void;
    /** Show the test dialog. */
    dialog: boolean;
    /** Create the main roll. Rerolls add their rolls while preparing. */
    createRoll: boolean;
    afterConsume?(test: SuccessTest): void;
    afterProcess?(test: SuccessTest): void;
}

/**
 * The ways a test can be executed, by id.
 */
export const TestModes: Record<'normal' | 'secondChance' | 'pushTheLimit', TestMode> = {
    /**
     * A first roll: prepare all values, ask the user, roll and process.
     */
    normal: {
        id: 'normal',
        prepare: test => test._prepareExecution(),
        dialog: true,
        createRoll: true,
    },

    /**
     * Reroll all dice without a hit, spending Edge. SR5#56.
     */
    secondChance: {
        id: 'secondChance',
        allowed: test => test.canSecondChance,
        prepare: test => test.populateDocuments(),
        requiresActor: true,
        beforeDialog: test => {
            test.data.secondChance = true;
            test.applySecondChance();
            test.calculateBaseValues();
            test.validateValues();
        },
        dialog: false,
        createRoll: false,
        // Second chance is spent with this roll only, rerolls of this test can't spend it again.
        afterConsume: test => { test.data.secondChance = false; },
    },

    /**
     * Add Edge to the pool after rolling, exploding sixes and ignoring the limit. SR5#56.
     */
    pushTheLimit: {
        id: 'pushTheLimit',
        allowed: test => test.canPushTheLimit,
        prepare: test => test.populateDocuments(),
        requiresActor: true,
        beforeDialog: test => {
            test.data.pushTheLimit = true;
            test.applyPushTheLimit();
            test.calculateBaseValues();
            test.validateValues();
        },
        dialog: false,
        createRoll: false,
        // Push the limit stays active while processing to ignore the limit, then it's spent.
        afterProcess: test => { test.data.pushTheLimit = false; },
    },
};
