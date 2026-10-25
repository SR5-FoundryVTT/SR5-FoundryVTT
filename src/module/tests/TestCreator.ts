import {SR5Item} from "../item/SR5Item";
import {SR5Actor} from "../actor/SR5Actor";
import {
    SuccessTest,
    SuccessTestMessageData,
    TestData,
    SuccessTestData,
    TestDocuments,
    TestOptions
} from "./SuccessTest";
import {DataDefaults} from "../data/DataDefaults";
import {ModifiableValue} from "../mods/ModifiableValue";
import {FLAGS, SYSTEM_NAME} from "../constants";
import {SR5Roll} from "../rolls/SR5Roll";
import {OpposedTest, OpposedTestData} from "./OpposedTest";
import { ActionRollType, DamageType, MinimalActionType } from "../types/item/Action";
import { ValueFieldType } from "../types/template/Base";
import { DeepPartial } from "fvtt-types/utils";
import { PackItemFlow } from "../item/flows/PackItemFlow";
import { ActionTestData } from "./ActionTestData";
import { FlowContext } from "../flows/FlowContext";
import type { FlowStep } from "../types/flows/FlowStep";

/**
 * Any test implementation can either be created by calling it's constructor directly or by using the TestCreator.
 * 
 * TestCreator provides a set of helper functions to create a test from different sources, as well as test data
 * based either on an items (or generic) action data or specific input (like from numerical values for pool, threshold,
 * and limit).
 * 
 * Usage:
 * See the different from* functions for entry points.
 * 
 * To retrieve a test implementation class, use the _getTestClass function.
 */
export const TestCreator = {
    /**
     * A helper method to create a SuccessTest from a simple pool value, without
     * actor / item involvement.
     *
     * TODO: fromPool as a name for 'from values' doesn't quite describe the method anymore, since a pool doesn't need to be given.
     * @param values The values to use for the test.
     * @param options See TestOptions documentation.
     */
    fromPool: function(values: { pool: number, limit?: number, threshold?: number }={pool: 0, limit: 0, threshold: 0}, options: Partial<TestOptions> = {}): SuccessTest {
        const data = TestCreator._minimalTestData();
        data.pool.base = values.pool;
        data.threshold.base = values.threshold || 0;
        data.limit.base = values.limit || 0;

        // Use the registered SuccessTest implementation.
        const successTestCls = TestCreator._getTestClass('SuccessTest')!;
        return new successTestCls(data, undefined, options);
    },

    /**
     * Create a Test from action item configuration.
     *
     * @param item Any item type that defines an action.
     * @param document The actor to use for the resulting SR5Roll,
     *              will default to the items parent otherwise.
     * @param options See SuccessTestOptions documentation.
     *
     * @returns Tries to create a SuccessTest from given action item or undefined if it failed.
     */
    fromItem: async function(item: SR5Item, document?: SR5Actor|SR5Item|null, options?: Partial<TestOptions>): Promise<SuccessTest | undefined> {
        if (!document) document = item.parent;

        // A preparation rolls on its own Force and Potency, so one without an actor can still be triggered. SR5#306.
        if (!document && item.isType('preparation')) {
            const action = item.getAction();
            if (!action) return;
            return TestCreator.fromAction(foundry.utils.duplicate(action) as ActionRollType, item, options);
        }

        if (!(document instanceof SR5Actor)) {
            console.error("Shadowrun 5e | A SuccessTest can only be created with an explicit Actor or Item with an actor parent.")
            return;
        }

        const action = item.getAction();
        if (!action) return;

        if (!action.test) {
            action.test = 'SuccessTest';
            console.warn(`Shadowrun 5e | An action without a defined test handler defaulted to ${'SuccessTest'}`);
        }

        if (!Object.hasOwn(game.shadowrun5e.tests, action.test)) {
            console.error(`Shadowrun 5e | Test registration for test ${action.test} is missing`);
            return;
        }

        // Any action item will return a list of values to create the test pool from.
        const cls = TestCreator._getTestClass(action.test) || SuccessTest;
        const data = await TestCreator._getTestDataFromItemAction(cls, item, document);
        const documents = {item, actor: document};
        return new cls(data, documents, options);
    },

    /**
     * Create a test from action data only, when not having an item.
     *
     * NOTE: While this method doesn't need to be async, keep async for consistency with other TestCreator.from* apis.
     *
     * @param action The action data to use for the test.
     * @param document The document to use for retrieving source values defined within the action.
     * @param options See TestOptions documentation.
     */
    // oxlint-disable-next-line typescript/require-await -- Public Promise based factory, callers await it.
    fromAction: async function(action: ActionRollType, document: SR5Actor | SR5Item, options: Partial<TestOptions> = {}): Promise<SuccessTest | undefined> {
        if (!action.test) {
            action.test = 'SuccessTest';
            console.warn(`Shadowrun 5e | An action without a defined test handler defaulted to ${'SuccessTest'}`);
        }

        if (!Object.hasOwn(game.shadowrun5e.tests, action.test)) {
            console.error(`Shadowrun 5e | Test registration for test ${action.test} is missing`);
            return;
        }

        // Any action item will return a list of values to create the test pool from.
        const cls = TestCreator._getTestClass(action.test) || SuccessTest;
        const data = TestCreator._prepareTestDataWithAction(action, document, TestCreator._minimalTestData());
        const actor = document instanceof SR5Actor ? document : undefined;
        const item = document instanceof SR5Item ? document : undefined;
        const documents = { actor, item };

        return new cls(data, documents, options);
    },

    /**
     * Create a test using an Action item stored in any collection
     * @param packName The package / compendium name to search for the action
     * @param actionName The items name within the given packName
     * @param document The document used to roll the test with
     * @param options General TestOptions
     */
    fromPackAction: async function(packName: string, actionName: string, document: SR5Actor | SR5Item, options: Partial<TestOptions> = {}): Promise<SuccessTest|undefined> {
        const item = await PackItemFlow.getPackAction(packName, actionName);
        if (!item) {
            console.error(`Shadowrun5 | The pack ${packName} doesn't include an item ${actionName}`);
            return;
        }

        return TestCreator.fromItem(item, document, options);
    },

    /**
     * Create a test implementation from a past test included within a message
     * 
     * @param id The message id to retrieve test data from.
     */
    // oxlint-disable-next-line typescript/require-await -- Public Promise based factory, callers await it.
    fromMessage: async function(id: string, options: Partial<TestOptions> = {}): Promise<SuccessTest | undefined> {
        const flagData = TestCreator.getTestDataFromMessage(id);
        if (flagData)
            return this._fromMessageTestData(flagData, options);
        return undefined;
    },

    /**
     * Retrieve possible test data from a given message id.
     * 
     * If you need the test implementation, use @fromMessage instead.
     * 
     * @param id The message id to retrieve test data from.
     * @returns Raw test data from message flags or undefined if none found.
     */
    getTestDataFromMessage(id: string): SuccessTestMessageData | undefined {
        const message = game.messages?.get(id);
        if (!message) {
            console.error(`Shadowrun 5e | Couldn't find a message for id ${id} to create a message action`);
            return;
        }

        // Check if message contains any test data.
        const flagData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as SuccessTestMessageData;
        if (!flagData) return;

        return flagData;
    },
    
    
    /**
     * Create a test implementation directly from a message flags test data.
     */
    _fromMessageTestData: function(testData: SuccessTestMessageData, options: Partial<TestOptions> = {}) {
        // Use test data to create the original test from it.
        testData = foundry.utils.deepClone(testData);
        if (!testData?.rolls) return;

        // Rolls are stored as toJSON output, which fromData consumes at runtime, but
        // @ts-expect-error fvtt-types' Roll.Data stub doesn't match that shape.
        const rolls = testData.rolls.map(roll => SR5Roll.fromData(roll));
        const documents = {rolls};

        // Allow callers to overwrite previous test options, otherwise fall back to stored options.
        options = { ...testData.data.options, ...options };
        return TestCreator.fromTestData(testData.data, documents, options);
    },

    /**
     * Create a test implementation for a specific action on a message.
     *
     * This can be an opposed test, resist or followup test.
     *
     * @param id The id of the to be used message.
     * @param testClsName The test class name to be used with the message test data.
     * @param options See TestOptions documentation.
     */
    fromMessageAction: async function(id: string, testClsName: string, options: Partial<TestOptions>={}): Promise<void> {
        if (!game.user) return;
        
        const message = game.messages?.get(id);
        if (!message) {
            console.error(`Shadowrun 5e | Couldn't find a message for id ${id} to create a message action`);
            return;
        }

        // Avoid altering test in flag.
        const testData = foundry.utils.duplicate(message.getFlag(SYSTEM_NAME, FLAGS.Test)) as SuccessTestMessageData;
        if (!testData?.data || !testData.rolls) {
            console.error(`Shadowrun 5e | Message with id ${id} doesn't have valid test data in it's flags.`);
            return;
        }

        const testClass = TestCreator._getTestClass(testClsName);
        if (!testClass) {
            console.error(`Shadowrun 5e | Couldn't find a registered test implementation for ${testClsName}`);
            return;
        }   

        return testClass.executeMessageAction(testData.data, id, options);
    },

    /**
     * Helper method to create a test implementation from given test data directly.
     * 
     * Test values will be taken from data and not refreshed from the source actor.
     *
     * @param data The TestData of some test implementation within test registry.
     * @param documents Documents to connect test to. These don't have to match the ones originally used and 
     *                  won't be used for retrieving source values.
     * @param options Optional test options.
     */
    fromTestData: function(data: TestData, documents?: TestDocuments, options: Partial<TestOptions> = {}): SuccessTest {
        const cls = TestCreator._getTestClass(data.type) || SuccessTest;
        return new cls(data, documents, options);
    },

    /**
     * Use any kind of opposed test to create a resist test based on that.
     * 
     * This can be used for damage resistance tests.
     * 
     * Within a typical success test, opposed test and resist test flow, this will
     * happen after both main and opposed test have finished. The resiting test will be 
     * executed in context of both with the actor of the opposed test as source.
     * 
     * The original action provides both the opposing and resiting test.
     *
     * @param opposed The opposed test to create a resist test with.
     * @param options See TestOptions documentation.
     * @param testClsName The resist test to use instead of the one configured on the original action.
     */
    // oxlint-disable-next-line typescript/require-await -- Public Promise based factory, callers await it.
    fromOpposedTestResistTest: async function(opposed: OpposedTest, options: Partial<TestOptions> = {}, testClsName?: string): Promise<SuccessTest | undefined> {
        // Don't change the data's source.
        const opposedData = foundry.utils.duplicate(opposed.data) as OpposedTestData;
        const resistTestName = testClsName || opposedData?.against?.opposed?.resist?.test;

        if (!resistTestName) {
            console.error(`Shadowrun 5e | Given test doesn't define an opposed resist test`, opposed);
            return undefined;
        }

        if (!opposed.source) {
            console.error(`Shadowrun 5e | Given test doesn't have a source actor`, opposed);
            return undefined;
        }

        const resistTestCls = TestCreator._getTestClass(resistTestName);
        if (!resistTestCls) return undefined;

        const data = TestCreator._getOpposedResistTestData(resistTestCls, opposedData, opposed.source, opposed.data.messageUuid);
        if (!data) return undefined;

        const documents = { source: opposed.source };

        return new resistTestCls(data, documents, options);
    },

    /**
     * Use any kind of test to create a followup test based on that.
     * 
     * This can be used for drain tests.
     * 
     * TODO: Describe a clear separation between resist and follow up test use cases.
     *
     * @param test Any test implementation with an action providing a follow up test.
     * @param options See TestOptions documentation.
     * @param testClsName The follow up test to use instead of the one configured on the action.
     */
    // oxlint-disable-next-line typescript/require-await -- Public Promise based factory, callers await it.
    fromFollowupTest: async function(test: SuccessTest, options: Partial<TestOptions> = {}, testClsName?: string): Promise<SuccessTest | undefined> {
        const followupTestName = testClsName || test?.data?.action?.followed?.test;
        if (!followupTestName) return;
        if (!test.item) {
            console.error(`Shadowrun 5e | Test doesn't have a populated item document`);
            return;
        }
        if (!test.actor) {
            console.error(`Shadowrun 5e | Test doesn't have a populated actor document`);
            return;
        }

        const testCls = TestCreator._getTestClass(followupTestName);
        if (!testCls) {
            console.error(`Shadowrun 5e | A ${test.constructor.name} has a unregistered follow up test configured`, this);
            return;
        }

        const data = Object.assign(TestCreator._minimalTestData(), {
            title: testCls.label,
            previousMessageId: test.data.messageUuid,
            against: test.data,
        });

        // The followed node settings come first, then document and test class defaults fill what's left.
        const followed = test.data.action?.followed ? TestCreator._nodeActionData(test.data.action.followed) : {};
        const action = TestCreator._mergeMinimalActionDataInOrder(
            DataDefaults.createData('action_roll', {...followed, test: testCls.name}),
            testCls._getDocumentTestAction(test.item, test.actor),
            testCls._getDefaultTestAction());

        const testData = testCls._prepareActionTestData(action, test.actor, data);
        (testData as { following?: unknown }).following = test.data;

        const documents = {source: test.source, item: test.item, actor: test.actor};

        return new testCls(testData, documents, options);
    },

    /**
     * Create the test of a flow step, following the given test.
     *
     * The test takes the settings of the steps action node, filled in by the defaults of its test
     * class and the item. It follows the given test like a follow up test does.
     *
     * @param parent The test the step follows.
     * @param step The step to create the test for.
     * @param subject Who rolls the test.
     * @param options See TestOptions documentation.
     */
    // oxlint-disable-next-line typescript/require-await -- Public Promise based factory, callers await it.
    fromStep: async function(parent: SuccessTest, step: FlowStep, subject: SR5Actor, options: Partial<TestOptions> = {}): Promise<SuccessTest | undefined> {
        const testCls = TestCreator._getTestClass(step.test);
        if (!testCls) return undefined;

        const data = Object.assign(TestCreator._minimalTestData(), {
            title: testCls.label,
            previousMessageId: parent.data.messageUuid,
            following: parent.data,
            sourceItemUuid: parent.data.sourceItemUuid,
            // Make sure to give NO target actors. Otherwise, user selection will be used.
            targetActorsUuid: [] as string[],
        });

        const item = parent.data.sourceItemUuid ? fromUuidSync(parent.data.sourceItemUuid) : null;
        const action = TestCreator._mergeMinimalActionDataInOrder(
            DataDefaults.createData('action_roll', { ...TestCreator._nodeActionData(step.settings), test: testCls.name }),
            item instanceof SR5Item ? testCls._getDocumentTestAction(item, subject) : {},
            testCls._getDefaultTestAction());

        // Resist and follow up tests work with the damage the step hands them, like resist tests after a defense do.
        const damage = FlowContext.stepDamage(step, parent, FlowContext.fromMessage(parent.data.messageUuid));
        if (damage) {
            data.following = { ...parent.data, modifiedDamage: damage } as SuccessTestData;
            (data as unknown as { incomingDamage: DamageType }).incomingDamage = damage;
        }

        // A chemical the step delivers, like a toxin resisted. See ToxinResistTest.
        if (step.config.payload) (data as unknown as { payload: unknown }).payload = foundry.utils.deepClone(step.config.payload);

        const testData = testCls._prepareActionTestData(action, subject, data);
        testData.features = [...step.features];

        return new testCls(testData, { source: subject, actor: subject }, options);
    },

    /*
     * Prompt the user for a default SuccessTest.
     */
    promptSuccessTest: async function() {
        // Get the last used pool size for simple SuccessTestDialogs
        const lastPoolValue = Number(game.user?.getFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue)) || 0;

        const test = TestCreator.fromPool({pool: lastPoolValue});
        await test.execute();

        if (test.evaluated) {
            // Store the last used pool size for the next simple SuccessTest
            await game.user?.setFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue, test.pool.value);
        }
    },

    /**
     * Return a test class from the global registry.
     *
     * @param testName A Test class constructor name registered as a test.
     */
    _getTestClass: function(testName: string | undefined | null): typeof SuccessTest | undefined {
        if (!testName) return undefined;
        if (!Object.hasOwn(game.shadowrun5e.tests, testName)) {
            console.error(`Shadowrun 5e | Tried getting a Test Class ${testName}, which isn't registered in: `, game.shadowrun5e.tests);
            return undefined;
        }
        return game.shadowrun5e.tests[testName] as typeof SuccessTest;
    },

    /**
     * Return test data based on an items action.
     *
     * @param testCls A test class implementation to use for retrieving action data.
     */
    // oxlint-disable-next-line typescript/require-await -- Promise based factory helper, callers await it.
    _getTestDataFromItemAction: async function(testCls: typeof SuccessTest, item: SR5Item, actor: SR5Actor): Promise<TestData> {
        // Prepare general data structure with labeling.
        const data = TestCreator._minimalTestData();
        // Action formulas read values of the item.
        data.sourceItemUuid = item.uuid ?? undefined;

        // Get user defined action configuration.
        let action = item.getAction() as ActionRollType;
        if (!action || !actor) {
            return data;
        }

        action = TestCreator._mergeMinimalActionDataInOrder(
            action,
            testCls._getDocumentTestAction(item, actor),
            testCls._getDefaultTestAction()
        );

        const testData = TestCreator._prepareTestDataWithAction(action, actor, data);
        TestCreator._mapItemSpecificLimitBase(item, action, testData);

        return testData;
    },

    /**
     * Replace generic numerical base limit values with item specific labels where possible.
     *
     * For weapons this maps the base limit value to an Accuracy part to improve code readability.
     */
    _mapItemSpecificLimitBase: function(item: SR5Item, action: ActionRollType, data: TestData) {
        if (!item.isType('weapon')) return;

        const accuracy = Number(action.limit.base);
        if (!Number.isFinite(accuracy) || accuracy === 0) return;

        const hasAccuracyBasePart = data.limit.changes.some(change =>
            ModifiableValue.isBaseChange(change) && change.name === 'SR5.Accuracy');

        if (hasAccuracyBasePart) return;

        data.limit.base = 0;
        ModifiableValue.addUniqueBase(data.limit, 'SR5.Accuracy', accuracy);
    },

    /**
     * An opposed resist test is related to the result of an opposed test.
     *
     * This can be a physical damage resist test and will be derived from configuration
     * of the original test that's being opposed.
     *
     * @param resistTestCls The resist test class to be used.
     * @param opposedData The opposing test, including the original test being opposed.
     * @param document The actor doing the testing.
     * @param previousMessageId The Message id of the originating opposing test.
     */
    _getOpposedResistTestData: function(resistTestCls: typeof SuccessTest, opposedData: OpposedTestData, document: SR5Actor|SR5Item, previousMessageId?: string) {
        if (!opposedData.against.opposed.resist.test) {
            console.error(`Shadowrun 5e | Supplied test action doesn't contain an resist test in it's opposed test configuration`, opposedData, this);
            return;
        }
        if (!document) {
            console.error(`Shadowrun 5e | Can't resolve opposed test values due to missing actor`, resistTestCls);
        }

        // Prepare general data structure with labeling.
        const data = Object.assign(TestCreator._minimalTestData(), {
            previousMessageId,
            following: opposedData,
            // Make sure to give NO target actors. Otherwise, user selection will be used.
            targetActorsUuid: [] as string[],
        });

        // Setup the original item actions minimal action resist configuration as a complete item action.
        let action = DataDefaults.createData('action_roll', TestCreator._nodeActionData(opposedData.against.opposed.resist));

        // Allow the resist test to overwrite action data dynamically based on the source item.
        let documentAction: DeepPartial<MinimalActionType> = {};
        if (opposedData.sourceItemUuid) {
            const item = fromUuidSync(opposedData.sourceItemUuid);
            if (item instanceof SR5Item && document instanceof SR5Actor) {
                documentAction = resistTestCls._getDocumentTestAction(item, document);
            }
        }

        // Provide default action information.
        action = TestCreator._mergeMinimalActionDataInOrder(
            action,
            documentAction,
            resistTestCls._getDefaultTestAction()
        );

        // Alter default action information with user defined information.
        return TestCreator._prepareTestDataWithAction(action, document, data);
    },

    /**
     * Prepare test data with source values based on action data. See ActionTestData.
     */
    _prepareTestDataWithAction: function(action: ActionRollType, document: SR5Actor|SR5Item, data: SuccessTestData, againstData?: SuccessTestData): SuccessTestData {
        return ActionTestData._prepareTestDataWithAction(action, document, data, againstData);
    },

    _prepareTestDataWithActionForActor: function(action: ActionRollType, actor: SR5Actor, data: SuccessTestData, againstData?: SuccessTestData) {
        return ActionTestData._prepareTestDataWithActionForActor(action, actor, data, againstData);
    },

    _prepareTestDataWithActionForItem: function(action: ActionRollType, item: SR5Item, data: SuccessTestData, againstData?: SuccessTestData): SuccessTestData {
        return ActionTestData._prepareTestDataWithActionForItem(action, item, data, againstData);
    },

    addCodeTermTrace(data: SuccessTestData, valueField: ValueFieldType) {
        ActionTestData.addCodeTermTrace(data, valueField);
    },

    /**
     * The test settings of an action node as a partial action. See ActionTestData.
     */
    _nodeActionData(node: object): DeepPartial<ActionRollType> {
        return ActionTestData._nodeActionData(node);
    },

    /**
     * Return minimal viable test data without test specific customization.
     */
    _minimalTestData: function(): SuccessTestData {
        return SuccessTest.applyStructuralDefaults({});
    },

    /**
     * Merge partial default actions into an action, keeping values set by the user. See ActionTestData.
     */
    _mergeMinimalActionDataInOrder: function(sourceAction: ActionRollType, ...defaultActions: DeepPartial<MinimalActionType>[]): ActionRollType {
        return ActionTestData._mergeMinimalActionDataInOrder(sourceAction, ...defaultActions);
    },

    _keepItemActionValue(action: ActionRollType, defaultAction: DeepPartial<MinimalActionType>, key: string): boolean {
        return ActionTestData._keepItemActionValue(action, defaultAction, key);
    },

    _actionHasNoneDefaultValue(action: ActionRollType, key: string): boolean {
        return ActionTestData._actionHasNoneDefaultValue(action, key);
    },

    /**
     * Determine if a test's dialog should NOT be shown, when executing a test.
     * 
     * @param event A PointerEvent by user interaction
     */
    shouldHideDialog(event?: Event): boolean {
        if (!event) return false;
        const bindings = game.keybindings.get("shadowrun5e", "hide-test-dialog");
        return bindings.some(binding => event[binding.key] === true);
    },

    /**
     * Determine if a test's dialog should be shown, when executing a test.
     * 
     * @param event A PointerEvent by user interaction
     */
    shouldShowDialog(event?: Event): boolean {
        return !TestCreator.shouldHideDialog(event);
    },

    /**
     * Determine if instead of rolling an item based test, only the item's description should be posted as a chat message.
     * 
     * @param event A PointerEvent by user interaction
     */
    shouldPostItemDescription(event?: Event): boolean {
        if (!event) return false;
        const bindings = game.keybindings.get("shadowrun5e", "show-item-card");
        return bindings.some(binding => event[binding.key] === true);
    }
};
