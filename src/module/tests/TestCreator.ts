import { ModifierFlowOptions } from './../actor/flows/ModifierFlow';
/**
 * All things around helping with Test creation.
 *
 */
import {SR5Item} from "../item/SR5Item";
import {SR5Actor} from "../actor/SR5Actor";
import {
    SuccessTest,
    SuccessTestMessageData,
    TestData,
    TestDocuments,
    TestOptions
} from "./SuccessTest";
import {DataDefaults} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";
import {SkillRules} from "../rules/SkillRules";
import {FLAGS, SYSTEM_NAME} from "../constants";
import {SR5Roll} from "../rolls/SR5Roll";
import {Helpers} from "../helpers";
import {OpposedTest, OpposedTestData} from "./OpposedTest";
import {SR5} from "../config";
import {SkillFlow} from "../actor/flows/SkillFlow";
import {ActionFlow} from "../item/flows/ActionFlow";

import MinimalActionData = Shadowrun.MinimalActionData;
import ActionRollData = Shadowrun.ActionRollData;
import RollEvent = Shadowrun.RollEvent;
import ModifierTypes = Shadowrun.ModifierTypes;

/**
 * Function collection to help create any kind of test implementation for different test cases (active, followup, opposed)
 *
 * see from* functions for different
 */
export const TestCreator = {
    /**
     * A helper method to create a SuccessTest from a simple pool value, without
     * actor / item involvement.
     *
     * TODO: fromPool as a name for 'from values' doesn't quite describe the method anymore, since a pool doesn't need to be given.
     * @param values
     * @param actor
     * @param options
     */
    fromPool: function(values: { pool: number, limit?: number, threshold?: number }={pool: 0, limit: 0, threshold: 0}, options?: TestOptions): SuccessTest {
        const data = TestCreator._minimalTestData();
        data.pool.base = values.pool;
        data.threshold.base = values.threshold || 0;
        data.limit.base = values.limit || 0;

        // Use the registered SuccessTest implementation.
        const successTestCls = TestCreator._getTestClass('SuccessTest');
        return new successTestCls(data, undefined, options);
    },

    /**
     * Create a Test from action item configuration.
     *
     * @param item Any item type that defines an action.
     * @param actor The actor to use for the resulting SR5Roll,
     *              will default to the items parent otherwise.
     * @param options See SuccessTestOptions documentation.
     *
     * @returns Tries to create a SuccessTest from given action item or undefined if it failed.
     */
    fromItem: async function(item: SR5Item, actor?: SR5Actor, options?: TestOptions): Promise<any | undefined> {
        //@ts-ignore Default to item parent actor, if none given.
        if (!actor) actor = item.parent;
        if (!(actor instanceof SR5Actor)) {
            console.error("Shadowrun 5e | A SuccessTest can only be created with an explicit Actor or Item with an actor parent.")
            return;
        }

        const action = item.getAction();
        if (!action) return;
        // Determine what initial test type to use.
        if (!action.test) {
            action.test = 'SuccessTest';
            console.warn(`Shadowrun 5e | An action without a defined test handler defaulted to ${'SuccessTest'}`);
        }

        // @ts-ignore // Check for test class registration.
        if (!game.shadowrun5e.tests.hasOwnProperty(action.test)) {
            console.error(`Shadowrun 5e | Test registration for test ${action.test} is missing`);
            return;
        }

        // Any action item will return a list of values to create the test pool from.
        // @ts-ignore // Get test class from registry to allow custom module tests.
        const cls = TestCreator._getTestClass(action.test);
        const data = await TestCreator._getTestDataFromItemAction(cls, item, actor);
        const documents = {item, actor};
        return new cls(data, documents, options);
    },

    /**
     * Create a test from action data only.
     *
     * @param action
     * @param actor
     * @param options
     */
    fromAction: async function(action: ActionRollData, actor: SR5Actor, options?: TestOptions): Promise<SuccessTest | undefined> {
        if (!action.test) {
            action.test = 'SuccessTest';
            console.warn(`Shadowrun 5e | An action without a defined test handler defaulted to ${'SuccessTest'}`);
        }

        // @ts-ignore // Check for test class registration.
        if (!game.shadowrun5e.tests.hasOwnProperty(action.test)) {
            console.error(`Shadowrun 5e | Test registration for test ${action.test} is missing`);
            return;
        }

        // Any action item will return a list of values to create the test pool from.
        // @ts-ignore // Get test class from registry to allow custom module tests.
        const cls = TestCreator._getTestClass(action.test);
        const data = await TestCreator._prepareTestDataWithAction(action, actor, TestCreator._minimalTestData());
        const documents = {actor};

        return new cls(data, documents, options);
    },

    /**
     * Create a test using an Action item stored in any collection
     * @param packName The package / compendium name to search for the action
     * @param actionName The items name within the given packName
     * @param actor The actor used to roll the test with
     * @param options General TestOptions
     */
    fromPackAction: async function(packName: string, actionName: string, actor: SR5Actor, options?: TestOptions): Promise<SuccessTest|undefined> {
        const item = await Helpers.getPackAction(packName, actionName);
        if (!item) {
            console.error(`Shadowrun5 | The pack ${packName} doesn't include an item ${actionName}`);
            return;
        }

        return TestCreator.fromItem(item, actor, options);
    },

    /**
     * Create a test implementation from a past test included within a message
     * @param id
     */
    fromMessage: async function(id: string): Promise<SuccessTest | undefined> {
        const message = game.messages?.get(id);
        if (!message) {
            console.error(`Shadowrun 5e | Couldn't find a message for id ${id} to create a message action`);
            return;
        }

        // Check if message contains any test data.
        const flagData = message.getFlag(SYSTEM_NAME, FLAGS.Test);
        if (!flagData) return;

        // Use test data to create the original test from it.
        const testData = foundry.utils.duplicate(flagData) as SuccessTestMessageData;
        if (!testData) {
            console.error(`Shadowrun 5e | Message with id ${id} doesn't have test data in it's flags.`);
            return;
        }

        const rolls = testData.rolls.map(roll => SR5Roll.fromData(roll as any));
        const documents = {rolls};
        return TestCreator.fromTestData(testData.data, documents, testData.data.options);
    },

    /**
     * Create a test implementation for a specific action on a message.
     *
     * This can be an opposed test, resist or followup test.
     *
     * @param id The id of the to be used message.
     * @param testClsName The test class name to be used with the message test data.
     * @param options
     */
    fromMessageAction: async function(id: string, testClsName: string, options?: TestOptions): Promise<SuccessTest | undefined> {
        if (!game.user) return;
        
        const message = game.messages?.get(id);
        if (!message) {
            console.error(`Shadowrun 5e | Couldn't find a message for id ${id} to create a message action`);
            return;
        }

        // Avoid altering test in flag.
        const testData = foundry.utils.duplicate(message.getFlag(SYSTEM_NAME, FLAGS.Test)) as SuccessTestMessageData;
        if (!testData || !testData.data || !testData.rolls) {
            console.error(`Shadowrun 5e | Message with id ${id} doesn't have valid test data in it's flags.`);
            return;
        }

        // @ts-ignore // TODO: Add typing by declaration merging
        const testClass = TestCreator._getTestClass(testClsName);
        if (!testClass) {
            console.error(`Shadowrun 5e | Couldn't find a registered test implementation for ${testClsName}`);
            return;
        }

        // Determine actors to roll test with.
        // First - use selection or targets.
        let actors = Helpers.userHasControlledTokens() ? 
            Helpers.getControlledTokenActors() :
            await Helpers.getTestTargetActors(testData.data);

        // Second - filter out actors current user shouldn't be able to test with.
        actors = actors.filter(actor => actor.isOwner);
        // Last - Fallback to player character.
        if (actors.length === 0 && game.user.character) actors.push(game.user.character);

        if (actors.length === 0)
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.TokenSelectionNeeded'));
        else 
            console.log('Shadowrun 5e | Casting an opposed test using these actors', actors, testData);

        for (const actor of actors) {
            const data = await testClass._getOpposedActionTestData(testData.data, actor, id);
            if (!data) return;

            const documents = {actor};
            const test = new testClass(data, documents, options);

            // Await test chain resolution for each actor, to avoid dialog spam.
            await test.execute();
        }
    },

    /**
     * Helper method to create a SuccessTest from given data.
     *
     * TODO: Rework this method to restore test based on test type.
     *
     * @param data The TestData of some test implementation
     * @param documents Documents to create test with. These don't have to match the ones originally used.
     * @param options Optional test options.
     */
    fromTestData: function(data: TestData, documents?: TestDocuments, options?: TestOptions): SuccessTest {
        const type = data.type || 'SuccessTest';
        // @ts-ignore
        const cls = TestCreator._getTestClass(type);
        // Before used documents would be fetched during evaluation.
        return new cls(data, documents, options);
    },

    /**
     * Use any kind of opposed test to create a resist test based on that
     *
     * @param opposed
     * @param options
     */
    fromOpposedTestResistTest: async function(opposed: OpposedTest, options?: TestOptions): Promise<SuccessTest | void> {
        // Don't change the data's source.
        const opposedData = foundry.utils.duplicate(opposed.data);

        if (!opposedData?.against?.opposed?.resist?.test) return console.error(`Shadowrun 5e | Given test doesn't define an opposed resist test`, opposed);
        if (!opposed.actor) return console.error(`Shadowrun 5e | A ${opposed.title} can't operate without a populated actor given`);

        const resistTestCls = TestCreator._getTestClass(opposedData.against.opposed.resist.test);

        // Prepare the resist test.
        const data = await TestCreator._getOpposedResistTestData(resistTestCls, opposedData, opposed.actor, opposed.data.messageUuid);
        const documents = {actor: opposed.actor};

        // Initialize a new test of the current testing class.
        return new resistTestCls(data, documents, options);
    },

    /**
     * Create a followup test using a test.
     * This can be used for drain tests on spellcasting tests or for resist tests on defense tests
     *
     * @param test Any SuccessTest implementation with a followup.
     * @param options Optional test options.
     */
    fromFollowupTest: async function(test: SuccessTest, options?: TestOptions): Promise<SuccessTest  | void> {
        if (!test?.data?.action?.followed?.test) return;
        if (!test.item) return console.error(`Shadowrun 5e | Test doesn't have a populated item document`);
        if (!test.actor) return console.error(`Shadowrun 5e | Test doesn't have a populated actor document`);

        // @ts-ignore // TODO: Type merging
        const testCls = TestCreator._getTestClass( test.data.action.followed.test);
        if (!testCls) return console.error(`Shadowrun 5e | A ${test.constructor.name} has a unregistered follow up test configured`, this);

        const data = TestCreator._minimalTestData();
        data.title = testCls.title;
        data.previousMessageId = test.data.messageUuid;
        data.against = test.data;

        const action = TestCreator._mergeMinimalActionDataInOrder(
            DataDefaults.actionRollData({test: testCls.name}),
            await testCls._getDocumentTestAction(test.item, test.actor),
            testCls._getDefaultTestAction());

        const testData = await testCls._prepareActionTestData(action, test.actor, data);
        testData.following = test.data;

        // Create the followup test based on tests documents and options.
        const documents = {item: test.item, actor: test.actor};
        return new testCls(testData, documents, options);
    },

    /*
     * Prompt the user for a default SuccessTest
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

    /** Internal helpers */

    /**
     * Return a test class from the global registry.
     *
     * @param testName A Test class constructor name registered as a test.
     */
    _getTestClass: function(testName: string): any | undefined {
        //@ts-ignore
        if (!game.shadowrun5e.tests.hasOwnProperty(testName)) { //@ts-ignore
            console.error(`Shadowrun 5e | Tried getting a Test Class ${testName}, which isn't registered in: `, game.shadowrun5e.tests);
            return;
        } //@ts-ignore
        return game.shadowrun5e.tests[testName];
    },

    /**
     * Return test data based on an items action.
     *
     * @param testCls
     * @param item
     * @param actor
     */
    _getTestDataFromItemAction: async function(testCls, item: SR5Item, actor: SR5Actor): Promise<TestData> {
        // Prepare general data structure with labeling.
        const data = TestCreator._minimalTestData();

        // Get user defined action configuration.
        let action = item.getAction();
        if (!action || !actor) return data;

        action = TestCreator._mergeMinimalActionDataInOrder(
            action,
            await testCls._getDocumentTestAction(item, actor),
            testCls._getDefaultTestAction());

        return await TestCreator._prepareTestDataWithAction(action, actor, data);
    },

    /**
     * Prepare values as configured in an actions roll data using the given actor for roll parts and
     * modifying the given data to create a valid SuccessTestData.
     *
     * @param action An action configuration
     * @param actor Any type of actor
     * @param data Data of any SuccessTest implementation. Changes will keep the original reference.
     */
    _prepareTestDataWithAction: async function(action: ActionRollData, actor: SR5Actor, data) {
        // Action values might be needed later to redo the same test.
        data.action = action;

        const pool = new PartsList<number>(data.pool.mod);

        // Prepare pool values.
        if (action.skill) {
            // Grab the skill by its id (default skills), or its label (custom skills).
            const skill = actor.getSkill(action.skill) ?? actor.getSkill(action.skill, {byLabel: true});

            // Notify user about their sins.
            if (skill && !SkillFlow.allowRoll(skill)) ui.notifications?.warn('SR5.Warnings.SkillCantBeDefault', {localize: true});

            // Custom skills don't have a label, but a name.
            // Legacy skill don't have a name, but have a label.
            // Your mind is like this water, my friend. When it is agitated, it becomes difficult to see. But if you allow it to settle, the answer becomes clear.
            if (skill) pool.addUniquePart(skill.label || skill.name, SkillRules.level(skill));
            // TODO: Check if this is actual skill specialization and for a +2 config for it instead of MagicValue.
            if (action.spec) pool.addUniquePart('SR5.Specialization', SkillRules.SpecializationModifier);
        }
        // The first attribute is either used for skill or attribute only tests.
        if (action.attribute) {
            const attribute = actor.getAttribute(action.attribute, );
            // Don't use addUniquePart as one attribute might be used twice.
            if (attribute) pool.addPart(attribute.label, attribute.value);
            // Apply matrix modifiers, when applicable
            if (attribute && actor._isMatrixAttribute(action.attribute)) actor._addMatrixParts(pool, true);
        }
        // The second attribute is only used for attribute only tests.
        if (!action.skill && action.attribute2) {
            const attribute = actor.getAttribute(action.attribute2);
            // Don't use addUniquePart as one attribute might be used twice.
            if (attribute) pool.addPart(attribute.label, attribute.value);
            // Apply matrix modifiers, when applicable
            if (attribute && actor._isMatrixAttribute(action.attribute2)) actor._addMatrixParts(pool, true);
        }
        
        // A general pool modifier will be used as a base value.
        // NOTE: This might not be transparent to users, instead a normal .mod entry might better?
        //       That might clash with general pool modifier compilation though.
        if (action.mod) {
            data.pool.base = Number(action.mod);
        }
        
        // Include pool modifiers that have been collected on the action item.
        // Thes can come from nested items and more.
        if(action.dice_pool_mod) {
            action.dice_pool_mod.forEach(mod => PartsList.AddUniquePart(data.modifiers.mod, mod.name, mod.value));
        }
        
        // Add the armor value as a pool modifier, since 'armor' is part of the test description.
        if (action.armor) {
            const armor = actor.getArmor();
            data.pool.mod = PartsList.AddUniquePart(data.pool.mod,'SR5.Armor', armor.value);
        }

        // Prepare limit values...
        if (action.limit.base) {
            // TODO: For easier readability this could be mapped to an item specific limit value
            //       For WeaponItem this would result in 'Precision' to be shown instead of a numerical literal.
            data.limit.base = Number(action.limit.base);
        }
        //...add limit modifiers
        if (action.limit.mod) {
            action.limit.mod.forEach(mod => PartsList.AddUniquePart(data.limit.mod, mod.name, mod.value));
        }
        //...add limit attribute value based on actor.
        if (action.limit.attribute) {
            // Get the limit connected to the defined attribute.
            // NOTE: This might differ from the USED attribute...
            const limit = actor.getLimit(action.limit.attribute);
            if (limit) data.limit.mod = PartsList.AddUniquePart(data.limit.mod, limit.label, limit.value);
            if (limit && actor._isMatrixAttribute(action.limit.attribute)) actor._addMatrixParts(pool, true);
        }

        // Prepare threshold values...
        if (action.threshold.base) {
            data.threshold.base = Number(action.threshold.base);
        }

        // Prepare general damage values...
        // ...a test without damage, shouldn't contain any damage information.
        if (ActionFlow.hasDamage(action.damage)) {
            data.damage = foundry.utils.duplicate(action.damage);
        }

        // Prepare opposed and resist tests...
        if (action.opposed.test) {
            data.opposed = action.opposed;
        }

        
        // Prepare action modifiers and possible applicable selections
        const modifiers: {[key in ModifierTypes]?: string[]} = {};
        for (const modifier of data.action.modifiers) {
            // A modifier with an applicable selection is found.
            if (modifier.includes('.')) {
                // Assert correct action modifier segment structure.
                const segments = modifier.split('.') as string[];
                if (segments.length > 2) console.error('Shadowrun 5e | Action contained a partial modifier with more than two segments', modifier, data.action);

                // Record the modifier catgeory with it's single applicable.
                const [category, applicable] = segments;
                modifiers[category] = modifiers[category] ?? [];
                modifiers[category].push(applicable);

            // No applicable found yet, just collect the modifier
            } else {
                modifiers[modifier] = modifiers[modifier] ?? [];
            }
        }

        // Apply applicable selections and collect modifiers.
        for (const [modifier, applicable] of Object.entries(modifiers)) {
            // Setup the resulting modifier value.
            const label = SR5.modifierTypes[modifier];
            const options = {applicable};
            const value = actor.modifiers.totalFor(modifier, options);
            data.modifiers.mod = PartsList.AddUniquePart(data.modifiers.mod, label, value);
        }
        

        // Mark test as extended.
        data.extended = action.extended;

        return data;
    },

    /**
     * An opposed resist test is related to the result of an opposed test.
     *
     * This can be a physical damage resist test and will be derived from configuration
     * of the original test that's being opposed.
     *
     * @param resistTestCls
     * @param opposedData The opposing test, including the original test being opposed.
     * @param actor The actor doing the testing.
     * @param previousMessageId The Message id of the originating opposing test.
     */
    _getOpposedResistTestData: async function(resistTestCls, opposedData: OpposedTestData, actor: SR5Actor, previousMessageId?: string) {
        if (!opposedData.against.opposed.resist.test) {
            console.error(`Shadowrun 5e | Supplied test action doesn't contain an resist test in it's opposed test configuration`, opposedData, this);
            return;
        }
        if (!actor) {
            console.error(`Shadowrun 5e | Can't resolve opposed test values due to missing actor`, resistTestCls);
        }

        // Prepare general data structure with labeling.
        const data = TestCreator._minimalTestData();
        data.previousMessageId = previousMessageId;
        data.following = opposedData;
        // Make sure to give NO target actors. Otherwise, user selection will be used.
        data.targetActorsUuid = [];

        // Setup the original item actions minimal action resist configuration as a complete item action.
        let action = DataDefaults.actionRollData({
            ...opposedData.against.opposed.resist
        });
        // Provide default action information.
        action = TestCreator._mergeMinimalActionDataInOrder(
            action,
            resistTestCls._getDocumentTestAction(),
            resistTestCls._getDefaultTestAction()
        );

        // Alter default action information with user defined information.
        return await TestCreator._prepareTestDataWithAction(action, actor, data);
    },

    /**
     * Return the minimal viable test data without test specific customization.
     */
    _minimalTestData: function(): any {
        return {
            pool: DataDefaults.valueData({label: 'SR5.DicePool'}),
            limit: DataDefaults.valueData({label: 'SR5.Limit'}),
            threshold: DataDefaults.valueData({label: 'SR5.Threshold'}),
            damage: DataDefaults.damageData(),
            modifiers: DataDefaults.valueData({label: 'SR5.Labels.Action.Modifiers'}),
            values: {},
            action: DataDefaults.actionRollData(),
            opposed: {}
        };
    },

    /**
     * Merge multiple MinimalActionData objects into one action object. This will only look at keys within a minimal action,
     * not all action keys.
     *
     * A value of a minimal action will only overwrite the main action value if that is not set.
     * 
     * For example:
     * A: action.skill == '' will be overwritten by minimalAction.skill == 'Spellcasting'
     * B: action.skill == 'ritual_spellcasting' won't be overwritten by minimalAction.skill == 'Spellcasting'
     * C: action.armor == true will be overwritten by minimalAction.armor == false
     *
     * @param sourceAction Main action, as defined by user input.
     * @param defaultActions List of partial actions, as defined by test implementions.
     * @returns A copy of the main action with all minimalActions properties applied in order of arguments.
     */
    _mergeMinimalActionDataInOrder: function(sourceAction, ...defaultActions: Partial<MinimalActionData>[]): ActionRollData {
        // This action might be taken from ItemData, causing changes to be reflected upstream.
        const resultAction = foundry.utils.duplicate(sourceAction);

        // Check if overwriting default 
        for (const defaultAction of defaultActions) {
            if (Object.keys(defaultAction).length === 0) continue;

            // Iterate over complete MinimalActionData to avoid tests providing other ActionRollData fields they're not
            // supposed to override.
            for (const key of Object.keys(DataDefaults.minimalActionData())) {
                if (TestCreator._keepItemActionValue(sourceAction, defaultAction, key)) continue;

                resultAction[key] = defaultAction[key];
            }
        }

        return resultAction;
    },

    /**
     * Should an action value be kept even if a default action defines another value?
     * 
     * This comparison checks either a simple value against defaults OR checks values grouped as a 
     * logical unit (skill+attribute/2)
     * 
     * @param action The original action data.
     * @param defaultAction A partial action that may provide values to apply to the main action.
     * @param key The action key to take the value from
     * @returns true for when the orgiginal action value should be kept, false if it's to be overwritten.
     */
    _keepItemActionValue(action: ActionRollData, defaultAction: Partial<MinimalActionData>, key: string): boolean {
        if (!defaultAction.hasOwnProperty(key)) return true;

        // Avoid user confusion. A user might change one value of a logical value grouping (skill+attribute)
        // and get a default value for the other. 
        // Instead check some values as a section and only use default values when not one value of that
        // section has been changed by user input.
        const skillSection = ['skill', 'attribute', 'attribute2', 'armor'];
        if (skillSection.includes(key)) {
            const noneDefault = skillSection.some(sectionKey => TestCreator._actionHasNoneDefaultValue(action, sectionKey));
            return noneDefault;
        }
    
        // Fallback to basic value checking.
        return TestCreator._actionHasNoneDefaultValue(action, key);
    },

    /**
     * Determine if the field value behind the action property 'key' is of a none-default value.
     * 
     * This can be used to determine if a user / automated change has been made.
     * 
     * @param action Any action configuration.
     * @param key A key of action configuration within action parameter
     * @returns false, when the value behind key is a default value. true, when it's a custom value.
     */
    _actionHasNoneDefaultValue(action: ActionRollData, key: string): boolean {
        if (!action.hasOwnProperty(key)) return false;

        // NOTE: A more complete comparison would take a default ActionRollData object and compare the sub-key against it.
        const value = action[key];
        const type = foundry.utils.getType(value);

        // A value name should only be overwritten when no value has been user selected.
        // This would affect .skill and .attribute like fields.
        if (type === 'string') return value.length > 0;
        // A list of value names should only be overwritten when not one has been user selected.
        // This would affect .modifiers like fields.
        if (type === 'Array') return value.length > 0;
        // Booleans don't have a intrinsic default value on ActionRollData.
        if (type === 'boolean' && key === 'armor') return action[key] === true; // default is false

        return false;
    },

    /**
     * A helper to define the modifier key for all sheet test interactions to cause a test to not show its dialog.
     * @param event A PointerEvent by user interaction
     */
    shouldHideDialog(event: RollEvent|undefined): boolean {
        if (!event) return false;
        return event[SR5.kbmod.HIDE_DIALOG] === true;
    },

    /**
     * A helper to define the modifier key for all sheet test interactions to cause a test to show its dialog.
     * @param event A PointerEvent by user interaction
     */
    shouldShowDialog(event: RollEvent|undefined): boolean {
        return !TestCreator.shouldHideDialog(event);
    },

    /**
     * A helper to define the modifier key for all sheet test interactions to cause a test to not show its dialog.
     * @param event A PointerEvent by user interaction
     */
    shouldPostItemDescription(event: RollEvent|undefined): boolean {
        if (!event) return false;
        return event[SR5.kbmod.ITEM_DESCR] === true;
    }
};