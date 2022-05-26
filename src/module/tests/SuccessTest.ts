import {SR5Actor} from "../actor/SR5Actor";
import {CORE_FLAGS, CORE_NAME, FLAGS, SR, SYSTEM_NAME} from "../constants";
import {DefaultValues} from "../data/DataDefaults";
import {Helpers} from "../helpers";
import {SR5Item} from "../item/SR5Item";
import {SR5Roll} from "../rolls/SR5Roll";
import {PartsList} from "../parts/PartsList";
import {ShadowrunTestDialog} from "../apps/dialogs/ShadowrunTestDialog";
import {TestDialog} from "../apps/dialogs/TestDialog";
import ValueField = Shadowrun.ValueField;
import DamageData = Shadowrun.DamageData;
import OpposedTestData = Shadowrun.OpposedTestData;
import ModifierTypes = Shadowrun.ModifierTypes;
import ActionRollData = Shadowrun.ActionRollData;
import {SR5} from "../config";

export interface TestDocuments {
    actor?: SR5Actor
    item?: SR5Item
    rolls?: SR5Roll[]
}

export interface TestValues {
    [name: string]: ValueField | DamageData
}

export interface SuccessTestValues extends TestValues {
    hits: ValueField
    netHits: ValueField
    glitches: ValueField
}

interface TestModifier {
    type: ModifierTypes
    label: string
    total: number
}

/**
 * Contain all data necessary to handle an action based test.
 */
export interface TestData {
    title?: string
    // TODO: implement typing method to apply effects to and for ations.
    // TODO: Show set of test types here
    type?: string

    // Shadowrun 5 related test values.
    // TODO: Think about moving these into general values. This would allow ActiveEffects to only target .values
    pool: ValueField
    threshold: ValueField
    limit: ValueField

    // TODO: Is this still necessary?
    values: TestValues

    damage: DamageData

    // A list of modifier descriptions to be used for this test.
    // These are designed to work with SR5Actor.getModifier()
    // modifiers: Record<ModifierTypes, TestModifier>
    modifiers: ValueField

    // The source action this test is derived from.
    action: ActionRollData

    // Documents the test might has been derived from.
    sourceItemUuid?: string
    sourceActorUuid?: string

    // Message the test has been represented with.
    messageUuid?: string

    // Options the test was created with.
    options?: TestOptions
}

export interface SuccessTestData extends TestData {
    opposed: OpposedTestData
    values: SuccessTestValues
    // Scene Token Ids marked as targets of this test.
    targetActorsUuid: string[]
}

export interface TestOptions {
    showDialog?: boolean // Show dialog when defined as true.
    showMessage?: boolean // Show message when defined as true.
    rollMode?: keyof typeof CONFIG.Dice.rollModes
    pushTheLimit?: boolean
    secondChance?: boolean
}

export interface SuccessTestMessageData {
    data: SuccessTestData,
    rolls: SR5Roll[]
}

/**
 * General handling of Shadowrun 5e success tests.
 *
 * This class handles all Shadowrun 5 rules surround success tests,
 * except for the dice rolling itself as well the flow handling of multi roll tests.
 *
 * TODO: Check if Actor.getRollData() can be used to better implement this
 * TODO: Add unittesting.
 */
export class SuccessTest {
    public data: SuccessTestData;
    public actor: SR5Actor | undefined;
    public item: SR5Item | undefined;
    public rolls: SR5Roll[];

    public targets: TokenDocument[]

    // TODO: include modifiers
    // TODO: store options in data for later re roll with same options?
    constructor(data, documents?: TestDocuments, options?: TestOptions) {
        // TODO: Move roll to documents (or name it context)

        // Store given documents to avoid later fetching.
        this.actor = documents?.actor;
        this.item = documents?.item;
        this.rolls = documents?.rolls || [];
        this.targets = [];

        options = options || {}

        this.data = this._prepareData(data, options);

        this.calculateBaseValues();

        console.info(`Shadowrun 5e | Created ${this.constructor.name} Test`, this);
    }

    /**
     * Prepare TestData
     *
     * @param data
     * @param options
     */
    _prepareData(data, options: TestOptions) {
        data.type = data.type || this.type;

        // Store the current users targeted token ids for later use.
        // @ts-ignore // undefined isn't allowed but it's excluded.
        data.targetActorsUuid = data.targetActorsUuid || Helpers.getUserTargets().map(token => token.actor?.uuid).filter(uuid => !!uuid);

        // Store given document uuids to be fetched during evaluation.
        // TODO: Include all necessary sepaker / token info in SuccessTestData to allow items to be deleted.
        data.sourceActorUuid = data.sourceActorUuid || this.actor?.uuid;
        data.sourceItemUuid = data.sourceItemUuid || this.item?.uuid;

        // @ts-ignore // Prepare general test information.
        data.title = data.title || this.constructor.label;

        // @ts-ignore // In FoundryVTT core settings we shall trust.
        options.rollMode = options.rollMode !== undefined ? options.rollMode : game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);
        options.showDialog = options.showDialog !== undefined ? options.showDialog : true;
        options.showMessage = options.showMessage !== undefined ? options.showMessage : true;

        options.pushTheLimit = options.pushTheLimit !== undefined ? options.pushTheLimit : false;
        options.secondChance = options.secondChance !== undefined ? options.secondChance : false;

        // Options will be used when a test is reused further on.
        data.options = options;

        // Set possible missing values.
        data.pool = data.pool || DefaultValues.valueData({label: 'SR5.DicePool'});
        data.threshold = data.threshold || DefaultValues.valueData({label: 'SR5.Threshold'});
        data.limit = data.limit || DefaultValues.valueData({label: 'SR5.Limit'});

        data.values = data.values || {};
        data.opposed = data.opposed || undefined;
        data.modifiers = this._prepareModifiers(data.modifiers);

        return data;
    }

    /**
     * Prepare a default modifier object.
     *
     * This should be used for whenever a Test doesn't modifiers specified externally.
     */
    _prepareModifiers(modifiers?: ValueField) {
        return modifiers || DefaultValues.valueData({label: 'SR5.Labels.Action.Modifiers'});
    }

    get type(): string {
        return this.constructor.name;
    }

    /**
     * A helper method to create a SuccessTest from action items.
     *
     * @param item Any item type that defines an action.
     * @param actor The actor to use for the resulting SR5Roll,
     *              will default to the items parent otherwise.
     * @param options See SuccessTestOptions documentation.
     *
     * @returns Tries to create a SuccessTest from given action item or undefined if it failed.
     */
    static async fromAction(item: SR5Item, actor?: SR5Actor, options?: TestOptions): Promise<SuccessTest | undefined> {
        //@ts-ignore
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
        const cls = game.shadowrun5e.tests[action.test];
        const data = await cls._getItemActionTestData(item, actor);
        const documents = {item, actor};
        return new cls(data, documents, options);
    }

    /**
     * Instead of user configured values from the action, use default action values given by SR5CONFIG for
     * this test class.
     *
     * @param actor The actor to cast the test.
     * @param options See SuccessTestOptions documentation.
     */
    static async fromDefaultAction(actor: SR5Actor, options?: TestOptions) {
        if (!(actor instanceof SR5Actor)) {
            console.error("Shadowrun 5e | A test can only be created with an explicit Actor or Item with an actor parent.")
            return;
        }

        if (!SR5.testDefaultAction[this.name]) {
            console.error("Shadowrun 5e | A test can only use default action when they're configured within SR5CONFIG.");
            return;
        }

        // @ts-ignore // TODO: Typing
        const cls = game.shadowrun5e.tests[this.name];
        const data = await cls._getDefaultActionTestData(actor);
        const documents = {actor};
        return new cls(data, documents, options);
    }

    /**
     * Helper method to create a SuccessTest from given data.
     *
     * TODO: Rework this method to restore test based on test type.
     *
     * @param data
     * @param documents
     * @param options
     */
    static fromTestData(data, documents?: TestDocuments, options?: TestOptions): SuccessTest {
        const type = data.type || 'SuccessTest';
        // @ts-ignore
        const cls = game.shadowrun5e.tests[type];
        // Before used documents would be fetched during evaluation.
        return new cls(data, documents, options);
    }

    /**
     * A helper method to create a SuccessTest from a simple pool value, without
     * actor / item involvement.
     *
     * TODO: fromPool as a name for 'from values' doesn't quite describe the method anymore, since a pool doesn't need to be given.
     * @param values
     * @param options
     */
    static fromPool(values?: { pool?: number, limit?: number, threshold?: number }, options?: TestOptions): SuccessTest {
        const testData = {
            pool: DefaultValues.valueData({label: 'SR5.DicePool', base: values?.pool || 0}),
            threshold: DefaultValues.valueData({label: 'SR5.Threshold', base: values?.threshold || 0}),
            limit: DefaultValues.valueData({label: 'SR5.Limit', base: values?.limit || 0}),
        };

        return new SuccessTest(testData, undefined, options);
    }

    /**
     *
     * @param id
     */
    static async fromMessage(id: string): Promise<SuccessTest | undefined> {
        const message = game.messages?.get(id);
        if (!message) {
            console.error(`Shadowrun 5e | Couldn't find a message for id ${id} to create a message action`);
            return;
        }

        const testData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as SuccessTestMessageData;
        if (!testData) {
            console.error(`Shadowrun 5e | Message with id ${id} doesn't have test data in it's flags.`);
            return;
        }

        const rolls = testData.rolls.map(roll => SR5Roll.fromData(roll as any));
        const documents = {rolls};
        return this.fromTestData(testData.data, documents, testData.data.options);
    }

    /**
     * TODO: Check if this method is still usefull when a dialog is an inbetween and not an initator of a test.
     */
    static async fromDialog(): Promise<SuccessTest | undefined> {
        // Ask user for additional, general success test role modifiers.
        const testDialogOptions = {
            // TODO: move to SuccessTest.label
            title: game.i18n.localize('SR5.Tests.SuccessTest'),
            limit: DefaultValues.valueData({label: 'SR5.Limit', value: 1}),
            threshold: DefaultValues.valueData({label: 'SR5.Threshold', value: 1}),
        };

        // Get the last used pool size for simple SuccessTestDialogs
        const lastPoolValue = game.user?.getFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue) || 0;
        // Prepare any predefined pool values.

        const pool = DefaultValues.valueData();
        // @ts-ignore // unkown[] vs number[]
        pool.mod = PartsList.AddUniquePart(pool.mod, 'SR5.LastRoll', lastPoolValue);
        const testDialog = await ShadowrunTestDialog.create(
            undefined,
            testDialogOptions,
            pool.mod);

        const dialogData = await testDialog.select();

        if (testDialog.canceled) return;

        // Extract simple test data from dialog user selection.
        pool.mod = dialogData.parts.list;
        pool.value = Helpers.calcTotal(pool, {min: 0});
        const thresholdValue = dialogData.threshold.value || 0;
        const limitValue = dialogData.limit.value || 0;

        // Create and display SuccessTest.
        const test = SuccessTest.fromPool({
            pool: pool.value,
            threshold: thresholdValue,
            limit: limitValue
        }, {showDialog: false});
        await test.execute();

        // Store the last used pool size for the next simple SuccessTest
        await game.user?.setFlag(SYSTEM_NAME, FLAGS.LastRollPromptValue, pool.value);

        return test;
    }

    static async fromMessageAction(id: string, test: string): Promise<SuccessTest | undefined> {
        const message = game.messages?.get(id);
        if (!message) {
            console.error(`Shadowrun 5e | Couldn't find a message for id ${id} to create a message action`);
            return;
        }

        const testData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as SuccessTestMessageData;
        if (!testData || !testData.data || !testData.rolls) {
            console.error(`Shadowrun 5e | Message with id ${id} doesn't have valid test data in it's flags.`);
            return;
        }

        // @ts-ignore // TODO: Add typing by declaration merging
        const testClass = game.shadowrun5e.tests[test];
        if (!testClass) {
            console.error(`Shadowrun 5e | Couldn't find a registered test implementation for ${test}`);
            return;
        }

        // TODO: Handle token selection as target override.
        const actors = Helpers.getSelectedActorsOrCharacter();

        if (actors.length === 0)
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.TokenSelectionNeeded'));

        for (const actor of actors) {
            const data = await testClass.getMessageActionTestData(testData.data, actor, id);
            if (!data) return;

            const documents = {actor};
            const test = new testClass(data, documents);

            // TODO: Handle dialog visibility based on SHIFT+CLICK of whoever casts opposed action.
            // Await test chain resolution for each actor, to avoid dialog spam.
            await test.execute();
        }
    }

    static async resistAgainstOpposed(test, options?: TestOptions) {
        if (!test) return console.error(`Shadowrun 5e | A ${this.name} against an opposed action was given a none opposed test type`, test);
        if (!test.actor) return console.error(`Shadowrun 5e | A ${this.name} can't operate without an actor given`);

        // Don't change the data's source.
        const testData = foundry.utils.duplicate(test.data);

        // Prepare the resist test.
        const data = await this.getResistActionTestData(testData, test.actor, test.data.messageUuid);
        const documents = {actor: test.actor};

        // Initialize a new test of the current testing class.
        return new this(data, documents, options);
    }

    /**
     * TODO: This is complicated and confusing. Maybe have a TestCreation handler for SuccessTest, OpposedTest, ResistTest, TeamTest and so forth
     *
     * @param testData The original test that we're resisting against.
     * @param actor The actor to get values from to resist damage
     * @param previousMessageId The previous message id in the test chain
     */
    static async getResistActionTestData(testData, actor: SR5Actor, previousMessageId: string) {
        const data = await this._getDefaultActionTestData(actor);

        data.previousMessageId = previousMessageId;
        data.resisting = testData;

        return data;
    }

    toJSON() {
        return {
            data: this.data,
            rolls: this.rolls
        };
    }

    /**
     * Get the lowest side for a Shadowrun 5 die to count as a success
     * TODO: Implement edge rules.
     */
    static get lowestSuccessSide(): number {
        return Math.min(...SR.die.success);
    }

    /**
     * Get the lowest side for a Shadowrun 5 die to count as a glitch.
     * TODO: Implement edge rules.
     */
    static get lowestGlitchSide(): number {
        return Math.min(...SR.die.glitch);
    }

    /**
     * Test Data is structured around Values that can be modified.
     */
    static async _getItemActionTestData(item: SR5Item, actor: SR5Actor) {
        // Prepare general data structure with labeling.
        const data = {
            pool: DefaultValues.valueData({label: 'SR5.DicePool'}),
            limit: DefaultValues.valueData({label: 'SR5.Limit'}),
            threshold: DefaultValues.valueData({label: 'SR5.Threshold'}),
            damage: DefaultValues.damageData(),
            modifiers: DefaultValues.valueData({label: 'SR5.Labels.Action.Modifiers'}),
            opposed: {}
        };

        // Get user defined action configuration.
        const action = item.getAction();
        if (!action || !actor) return data;

        return await this._prepareActionTestData(action, actor, data);
    }

    static async _getDefaultActionTestData(actor: SR5Actor) {
        // Prepare general data structure with labeling.
        const data = {
            pool: DefaultValues.valueData({label: 'SR5.DicePool'}),
            limit: DefaultValues.valueData({label: 'SR5.Limit'}),
            threshold: DefaultValues.valueData({label: 'SR5.Threshold'}),
            damage: DefaultValues.damageData(),
            modifiers: DefaultValues.valueData({label: 'SR5.Labels.Action.Modifiers'}),
            opposed: {}
        };

        // TODO: Build this similar to opposed test flow to allow for custom resist attributs / skills.

        // Provide default action information.
        const defaultAction = SR5.testDefaultAction[this.name];
        const action = DefaultValues.actionData(defaultAction);
        if (!action) return data;

        // Alter default action information with user defined information.
        return await this._prepareActionTestData(action, actor, data);
    }

    static async _prepareActionTestData(action: ActionRollData, actor: SR5Actor, data) {
        // Action values might be needed later to redo the same test.
        data.action = action;

        // Prepare pool values.
        // TODO: Check if knowledge / language skills can be used for actions.
        if (action.skill) {
            const skill = actor.getSkill(action.skill);
            if (skill) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, skill.label, skill.value);
            // TODO: Check if this is actuall skill specialization and for a +2 config for it instead of MagicValue.
            if (action.spec) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, 'SR5.Specialization', 2);
        }
        // The first attribute is either used for skill or attribute only tests.
        if (action.attribute) {
            const attribute = actor.getAttribute(action.attribute);
            if (attribute) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, attribute.label, attribute.value);
        }
        // The second attribute is only used for attribute only tests.
        // TODO: Handle skill improvisation.
        if (!action.skill && action.attribute2) {
            const attribute = actor.getAttribute(action.attribute2);
            if (attribute) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, attribute.label, attribute.value);
        }
        if (action.mod) {
            data.pool.base = Number(action.mod);
        }

        // Prepare limit values...
        if (action.limit.attribute) {
            const limit = actor.getLimit(action.limit.attribute);
            if (limit) data.limit.mod = PartsList.AddUniquePart(data.limit.mod, limit.label, limit.value);
        }
        if (action.limit.base || action.limit.value) {
            data.limit.base = Number(action.limit.value);
        }

        // Prepare threshold values...
        if (action.threshold.base) {
            data.threshold.base = Number(action.threshold.base);
        }

        // Prepare general damage values...
        if (action.damage.base) {
            // TODO: Actual damage value calculation from actor to a numerical value.
            data.damage = action.damage;
        }
        if (action.damage.attribute) {
            const attribute = actor.getAttribute(action.damage.attribute);
            data.damage.mod = PartsList.AddUniquePart(data.damage.mod, attribute.label, attribute.value);
        }

        // Prepare opposed and resist tests...
        if (action.opposed.test) {
            data.opposed = action.opposed;
        }

        return data;
    }

    /**
     * Create test data from an opposed message action.
     *
     * This method is meant to be overridden if this testing class supports
     * testing against an opposed message action.
     *
     * If this test class doesn't support this opposed message actions it will
     * return undefined.
     *
     * @param testData The original test that's opposed.
     * @param actor The actor for this opposing test.
     * @param previousMessageId The id this message action is sourced from.
     */
    static async getMessageActionTestData(testData, actor: SR5Actor, previousMessageId: string): Promise<SuccessTestData | undefined> {
        console.error(`Shadowrun 5e | Testing Class ${this.name} doesn't support opposed message actions`);
        return;
    }

    static get label(): string {
        return `SR5.Tests.${this.name}`;
    }

    /**
     * Determine if this test has any kind of modifier types active
     */
    get hasModifiers(): boolean {
        return this.data.modifiers.mod.length > 0;
    }

    /**
     * Create a Shadowrun 5 pool formula which will count all hits.
     *
     * FoundryVTT documentation:
     *  Dice:       https://foundryvtt.com/article/dice-advanced/
     *  Modifiers:  https://foundryvtt.com/article/dice-modifiers/
     * Shadowrun5e: SR5#44
     *
     */
    get formula(): string {
        const pool = Helpers.calcTotal(this.data.pool, {min: 0});
        // Apply dice explosion, removing the limit is done outside the roll.
        const explode = this.hasPushTheLimit ? 'x6' : '';

        return `(${pool})d6cs>=${SuccessTest.lowestSuccessSide}${explode}`;
    }

    /**
     * Give a representation of this success test in the common Shadowrun 5 description style.
     * The code given is meant to provide information about value sources. Should a user overwrite
     * these values during dialog review, keep those hidden.
     *
     * Automatics + Agility + 3 (3) [2 + Physical]
     */
    get code(): string {
        // Add action dynamic value sources as labels.
        let pool = this.pool.mod.filter(mod => mod.value !== 0).map(mod => `${game.i18n.localize(mod.name)} (${mod.value})`);
        let threshold = this.threshold.mod.map(mod => game.i18n.localize(mod.name));
        let limit = this.limit.mod.map(mod => game.i18n.localize(mod.name));

        // Add action static value modifiers as numbers.
        if (this.pool.base > 0) pool.push(String(this.pool.base));
        if (this.threshold.base > 0) threshold.push(String(this.threshold.base));
        if (this.limit.base > 0) limit.push(String(this.limit.base));

        // Pool portion can be dynamic or static.
        let code = pool.join(' + ').trim() || `${this.pool.value}`;

        // Only add threshold / limit portions when appropriate.
        if (threshold.length > 0 && this.threshold.value > 0) code = `${code} (${threshold.join(' + ').trim()})`;
        if (limit.length > 0 && this.limit.value > 0) code = `${code} [${limit.join(' + ').trim()}]`;

        return code;
    }

    /**
     * Determine if this test can have a human-readable shadowrun test code representation.
     *
     * All parts of the test code can be dynamic, any will do.
     */
    get hasCode(): boolean {
        return this.pool.mod.length > 0 || this.threshold.mod.length > 0 || this.limit.mod.length > 0;
    }

    /**
     * Overwrite this method to alter the title of test dialogs and messages.
     */
    get title(): string {
        // @ts-ignore
        return `${game.i18n.localize(this.constructor.label)}`;
    }

    /**
     * Helper method to create the main SR5Roll.
     */
    createRoll(): SR5Roll {
        // TODO: Add typing for rolls?
        // @ts-ignore
        const roll = new SR5Roll(this.formula) as unknown as SR5Roll;
        this.rolls.push(roll);
        return roll;
    }

    get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/test-dialog.html';
    }

    get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/success-test-message.html';
    }

    /**
     * What TestDialog class to use for this test type?
     *
     * If you only need to display differing data you can also only define a different _dialogTemplate
     * @override This method if you want to use a different TestDialog.
     */
    _createTestDialog() {
        return new TestDialog({test: this, templatePath: this._dialogTemplate});
    }

    /**
     * Show the dialog class for this test type and alter test according to user selection.
     */
    async showDialog(): Promise<boolean> {
        if (!this.data.options?.showDialog) return true;

        const dialog = this._createTestDialog();

        const data = await dialog.select();
        if (dialog.canceled) return false;

        // Overwrite current test state with whatever the dialog gives.
        this.data = data;
        await this._alterTestDataFromDialogData();

        return true;
    }

    /**
     * Overwrite this method if you want to alter test data after dialog user selections been done.
     */
    async _alterTestDataFromDialogData() {}

    /**
     * Overwrite this method if you need to alter base values.
     */
    prepareBaseValues() {
        this.applyPushTheLimit();
        this.applyPoolModifiers();
    }

    /**
     * Handle chosen modifier types and apply them to the pool modifiers.
     */
    applyPoolModifiers() {
        const pool = new PartsList(this.pool.mod);

        // If the user overwrote the modifiers only apply that value
        if (this.data.modifiers.override) {
            pool.addUniquePart('SR5.Labels.Action.Modifiers', this.data.modifiers.override.value)
            return;
        }

        // Apply all modifiers configured for this test.
        for (const modifier of this.data.modifiers.mod) {
            // A modifier might have been asked for, but not given by the actor.
            pool.addUniquePart(modifier.name, modifier.value);
        }
    }

    /**
     * Calculate only the base test that can be calculated before the test has been evaluated.
     */
    calculateBaseValues() {
        this.data.modifiers.value = Helpers.calcTotal(this.data.modifiers);

        this.data.pool.value = Helpers.calcTotal(this.data.pool, {min: 0});
        this.data.threshold.value = Helpers.calcTotal(this.data.threshold, {min: 0});
        this.data.limit.value = Helpers.calcTotal(this.data.limit, {min: 0});

        console.log(`Shadowrun 5e | Calculated base values for ${this.constructor.name}`, this.data);
    }

    /**
     * Helper method to evaluate the internal SR5Roll and SuccessTest values.
     */
    async evaluate(): Promise<this> {
        // Evaluate all rolls.
        for (const roll of this.rolls) {
            // @ts-ignore // foundry-vtt-types is missing evaluated.
            if (!roll._evaluated)
                await roll.evaluate({async: true});
        }

        this.calculateDerivedValues();

        return this;
    }

    /**
     * Allow subclasses to populate a test before execution and any other steps.
     */
    async populateTests() {}

    /**
     * Rehydrate this test with Documents, should they be missing.
     * This can happen when a test is created from a ChatMessage.
     */
    async populateDocuments() {
        // Fetch documents, when no reference has been made yet.
        if (!this.actor && this.data.sourceActorUuid)
            this.actor = await fromUuid(this.data.sourceActorUuid) as SR5Actor || undefined;
        if (!this.item && this.data.sourceItemUuid)
            this.item = await fromUuid(this.data.sourceItemUuid) as SR5Item || undefined;
        if (this.targets.length === 0 && this.data.targetActorsUuid) {
            this.targets = [];
            for (const uuid of this.data.targetActorsUuid) {
                this.targets.push(await fromUuid(uuid) as TokenDocument);
            }
        }
    }

    /**
     * Prepare missing data based on this tests Documents before anything else is done.
     */
    async prepareDocumentData() {}

    /**
     * Prepare modifiers based on connected documents.
     *
     * Main purpose is to populate the configured modifiers for this test based on actor / items used.
     */
    async prepareDocumentModifiers()  {
        if (!this.actor) return;

        // These modifier types will apply for this test type.
        const testModifiers = SR5.testModifiers[this.constructor.name] || [];

        for (const type of testModifiers) {
            const value = await this.actor.modifiers.totalFor(type);
            const name = SR5.modifierTypes[type];

            PartsList.AddUniquePart(this.data.modifiers.mod, name, value, true);
        }
    }

    /**
     * Calculate the total of all values.
     */
    calculateDerivedValues() {
        // Calculate all derived / static values.
        this.data.values.hits = this.calculateHits();
        this.data.values.netHits = this.calculateNetHits();
        this.data.values.glitches = this.calculateGlitches();

                console.log(`Shadowrun 5e | Calculated derived values for ${this.constructor.name}`, this.data);
    }

    /**
     * Helper to get the pool value for this success test.
     */
    get pool(): ValueField {
        return this.data.pool;
    }

    /**
     * Helper to get the total limit value for this success test.
     */
    get limit(): ValueField {
        return this.data.limit;
    }

    /**
     * Helper to determine if this success test uses a limit.
     */
    get hasLimit(): boolean {
        return !this.hasPushTheLimit && this.limit.value > 0;
    }

    /**
     * Helper to determine if the hits have been lowered by the limit.
     *
     * This will compare actual roll hits, without applied limit.
     */
    get hasReducedHits(): boolean {
        return this.hits.value > this.limit.value;
    }

    /**
     * Helper to get the total threshold value for this success test.
     */
    get threshold(): ValueField {
        return this.data.threshold;
    }

    /**
     * Helper to determine if this success test uses a threshold.
     */
    get hasThreshold(): boolean {
        return this.threshold.value > 0;
    }

    /**
     * Helper to get the net hits value for this success test with a possible threshold.
     */
    calculateNetHits(): ValueField {
        // Maybe lower hits by threshold to get the actual net hits.
        const base = this.hasThreshold ?
            Math.max(this.hits.value - this.threshold.value, 0) :
            this.hits.value;

        // Calculate a ValueField for standardisation.
        const netHits = DefaultValues.valueData({
            label: "SR5.NetHits",
            base
        });
        netHits.value = Helpers.calcTotal(netHits, {min: 0});

        return netHits;
    }

    get netHits(): ValueField {
        return this.data.values.netHits;
    }

    /**
     * Helper to get the hits value for this success test with a possible limit.
     */
    calculateHits(): ValueField {
        const rollHits = this.rolls.reduce((hits, roll) => hits + roll.hits, 0);
        const hits = DefaultValues.valueData({
            label: "SR5.Hits",
            base: this.hasLimit ?
                Math.min(this.limit.value, rollHits) :
                rollHits
        });
        hits.value = Helpers.calcTotal(hits, {min: 0});

        return hits;
    }

    get hits(): ValueField {
        return this.data.values.hits;
    }

    /**
     * Helper to get the glitches values for this success test.
     */
    calculateGlitches(): ValueField {
        const rollGlitches = this.rolls.reduce((glitches, roll) => glitches + roll.glitches, 0);
        const glitches = DefaultValues.valueData({
            label: "SR5.Glitches",
            base: rollGlitches
        })
        glitches.value = Helpers.calcTotal(glitches, {min: 0});

        return glitches;
    }

    get glitches(): ValueField {
        return this.data.values.glitches;
    }

    /**
     * Helper to check if the current test state is glitched.
     */
    get glitched(): boolean {
        return this.glitches.value > Math.floor(this.pool.value / 2);
    }

    /**
     * Helper to check if the current test state is critically glitched.
     */
    get criticalGlitched(): boolean {
        return !this.success && this.glitched;
    }

    /**
     * Helper to check if the current test state is successful.
     *
     * Since a test can only really be a success when some threshold is met,
     * only report success when there is one.
     */
    get success(): boolean {
        return this.netHits.value > 0;
    }

    /**
     * Helper to check if the current test state is unsuccessful.
     */
    get failure(): boolean {
        return !this.success;
    }

    /**
     * How to call a successful test of this type.
     */
    get successLabel(): string {
        return 'SR5.Success';
    }

    /**
     * How to call a failed test of this type.
     */
    get failureLabel(): string {
        return 'SR5.Failure';
    }

    /**
     * Helper to check if opposing tests exist for this test.
     */
    get opposed(): boolean {
        return !!this.data.opposed && this.data.opposed.test !== '';
    }

    /**
     * TODO: This method results in an ugly description.
     *
     */
    get description(): string {
        const poolPart = this.pool.value;
        const thresholdPart = this.hasThreshold ? `(${this.threshold.value})` : '';
        const limitPart = this.hasLimit ? `[${this.limit.value}]` : '';
        return `${poolPart} ${thresholdPart} ${limitPart}`
    }

    get hasPushTheLimit(): boolean {
        return this.data.options?.pushTheLimit === true;
    }

    get hasSecondChance(): boolean {
        return this.data.options?.secondChance === true;
    }

    /**
     * Handle Edge rule 'push the limit' within this test.
     * TODO: Is this actually pushTheLimit or is it 'explode sixes?'
     */
    applyPushTheLimit() {
        if (!this.actor) return;

        const parts = new PartsList(this.pool.mod);

        if (this.hasPushTheLimit) {
            const edge = this.actor.getEdge().value;
            // Overwrite is needed to not keep adding edge when test is restored from message.
            parts.addUniquePart('SR5.PushTheLimit', edge, true);
        } else {
            parts.removePart('SR5.PushTheLimit');
        }
    }

    /**
     * Handle Edge rule 'second chance' within this test.
     */
    async applySecondChance() {
        console.log(`Shadowrun 5e | ${this.constructor.name} will apply second chance rules`);

        if (!this.data.sourceActorUuid) return;

        // Only count last roll as there might be multiple second chances already
        const lastRoll = this.rolls[this.rolls.length - 1];
        const dice = lastRoll.pool - lastRoll.hits;
        if (dice <= 0) return; // TODO: User info about no dice.;

        // Alter dice pool value for overall glitch calculation.
        const parts = new PartsList(this.pool.mod);
        // Second chance can stack, so don't add it as unique.
        parts.addPart('SR5.SecondChange', dice);

        this.calculateBaseValues();

        const formula = `${dice}d6`;
        const roll = new SR5Roll(formula);
        this.rolls.push(roll);

        await this.evaluate();
        await this.processResults();
        await this.toMessage();
    }

    /**
     * Handle resulting actor resource consumption after this test.
     *
     * TODO: Maybe make this a hook and transfer resources to consume (edge, ammo)
     */
    async consumeActorResources(): Promise<boolean> {
        if (!this.actor) return false;

        if (this.hasPushTheLimit) {
            if (this.actor.getEdge().uses <= 0) {
                ui.notifications?.error(game.i18n.localize('SR5.MissingResource.Edge'));
                return false;
            }
            await this.actor.useEdge();
        }

        // TODO: Add second chance consumption
        return true;
    }

    /**
     * TODO: Documentation.
     */
    async execute(): Promise<this> {
        await this.populateTests();
        await this.populateDocuments();
        await this.prepareDocumentModifiers();
        await this.prepareDocumentData();

        // Initial base value preparation will show default result without any user input.
        this.prepareBaseValues();
        this.calculateBaseValues();

        // Allow user to change details.
        const userConsented = await this.showDialog();
        if (!userConsented) return this;

        // Check if actor has all needed resources to even test.
        const actorConsumedResources = await this.consumeActorResources();
        if (!actorConsumedResources) return this;

        // Second base value preparation will show changes due to user input.
        this.prepareBaseValues();
        this.calculateBaseValues();

        this.createRoll();

        await this.evaluate();
        await this.processResults();

        await this.toMessage();

        await this.afterTestComplete();

        return this;
    }

    async processResults() {
        if (this.success) {
            await this.processSuccess();
        } else {
            await this.processFailure();
        }
    }

    /**
     * Allow subclasses to override behaviour after a successful test result.
     * @override
     */
    async processSuccess() {}

    /**
     * Allow subclasses to override behaviour after a failure test result
     * @override
     */
    async processFailure() {}

    async afterTestComplete() {
        if (this.success) {
            await this.afterSuccess();
        } else {
            await this.afterFailure();
        }
    }

    /**
     * Allow subclasses to override followup behavior after a successful test result
     * @override
     */
    async afterSuccess()  {}

    /**
     * Allow subclasses to override followup behavior after a failed test result
     * @override
     */
    async afterFailure() {}

    /**
     * Post this success test as a message to the chat log.
     */
    async toMessage(): Promise<ChatMessage | undefined> {
        if (!this.data.options?.showMessage) return;

        // Prepare message content.
        const templateData = this._prepareTemplateData();
        const content = await renderTemplate(this._chatMessageTemplate, templateData);
        // Prepare the actual message.
        const messageData = this._prepareMessageData(content);
        const message = await ChatMessage.create(messageData);

        if (!message) return;

        // Store message id for future use.
        this.data.messageUuid = message.uuid;

        // Prepare reuse of test data on subsequent tests after this one.
        await message.setFlag(SYSTEM_NAME, FLAGS.Test, this.toJSON());

        return message;
    }

    /**
     * Prepare chat message content data for this success test card.
     *
     * @returns Chat Message template data.
     *
     * TODO: Add template data typing.
     */
    _prepareTemplateData() {
        // Either get the linked token by collection or synthetic actor.
        // Unlinked collection actors will return multiple tokens and can't be resolved to a token.
        const linkedTokens = this.actor?.getActiveTokens(true) || [];
        const token = linkedTokens.length === 1 ? linkedTokens[0].id : undefined;

        return {
            title: this.data.title,
            test: this,
            // Note: While ChatData uses ids, this uses full documents.
            speaker: {
                actor: this.actor,
                token: token
            },
            item: this.item,
            opposedActions: this._prepareOpposedActionsTemplateData()
        }
    }

    /**
     * Prepare opposed test action buttons.
     *
     * Currently, one opposed action is supported, however the template
     * is prepared to support multiple action buttons.
     */
    _prepareOpposedActionsTemplateData() {
        if (!this.data.opposed) return [];

        if (!this.data.opposed.test) {
            console.error(`Shadowrun 5e | An opposed action without a defined test handler defaulted to ${'OpposedTest'}`);
            return;
        }
        // @ts-ignore TODO: Move this into a helper
        const testCls = game.shadowrun5e.tests[this.data.opposed.test];
        if (!testCls) return console.error('Shadowrun 5e | Opposed Action has no test class registered.')

        const action = {
            // Store the test implementation registration name.
            test: this.data.opposed.test,
            // Use test implementation label or sensible default.
            label: testCls.label || 'SR5.Tests.SuccessTest'
        };

        const {opposed} = this.data;

        if (this.data.opposed.mod) {
            action.label += ` ${this.data.opposed.mod}`;
        }

        return [action]
    }

    /**
     * Prepare chat message data for this success test card.
     *
     * @param content Pre rendered template content.
     */
    _prepareMessageData(content: string) {
        // Either get the linked token by collection or synthetic actor.
        // Unlinked collection actors will return multiple tokens and can't be resolved to a token.
        const linkedTokens = this.actor?.getActiveTokens(true) || [];
        const token = linkedTokens.length === 1 ? linkedTokens[0].id : undefined;

        const actor = this.actor?.id;
        const alias = game.user?.name;

        // const roll = SR5Roll.fromTerms([PoolTerm.fromRolls(this.rolls)]);
        const roll = this.rolls[this.rolls.length - 1];

        const messageData = {
            user: game.user?.id,
            speaker: {
                actor,
                alias,
                token
            },
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll,
            content,
            // TODO: Do we need this roll serialization since test is serialized into the message flat?
            rollMode: this.data.options?.rollMode
        }

        // Instead of manually applying whisper ids, let Foundry do it.
        // @ts-ignore TODO: Types Provide propper SuccessTestData and SuccessTestOptions
        ChatMessage.applyRollMode(messageData, this.data.options?.rollMode);

        return messageData;
    }

    static async _testDataFromMessage(id: string): Promise<SuccessTestData | undefined> {
        const message = game.messages?.get(id);
        if (!message) return;

        const testData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as SuccessTestData;
        if (!testData) return;
        else return testData;
    }

    /**
     * Register listeners for ChatMessage html created by a SuccessTest.
     *
     * This listener needs to be registered to the 'renderChatMessage' FoundryVTT hook.
     *
     * @param message
     * @param html
     * @param data
     */
    static chatMessageListeners(message: ChatMessage, html, data) {
        // TODO: This only works in the current sessions but will break on refresh, since registered events aren't persistent.
        html.find('.card-main-content').on('click', event => SuccessTest._chatToggleCardRolls(event, html));
        html.find('.chat-document-link').on('click', SuccessTest._chatOpenDocumentLink);
    }

    /**
     *
     * @param html
     * @param options
     */
    static chatMessageContextOptions(html, options) {
        const secondChance = async (li) => {
            const messageId = li.data().messageId;
            const test = await SuccessTest.fromMessage(messageId);
            if (!test) return console.error('Shadowrun 5e | Could not restore test from message');

            await test.applySecondChance();
        };

        const deleteOption = options.pop();

        options.push({
            name: game.i18n.localize('SR5.SecondChange'),
            callback: secondChance,
            condition: true, // TODO: Disable when second chance has been used.
            icon: '<i class="fas fa-meteor"></i>'
        })

        options.push(deleteOption);

        return options;
    }

    /**
     * By default roll results are hidden in a chat card.
     *
     * This will hide / show them, when called with a card event.
     *
     * @param event Called from within a card html element.
     * @param cardHtml A chat card html element.
     */
    static async _chatToggleCardRolls(event, cardHtml) {
        event.preventDefault();

        const element = cardHtml.find('.dice-rolls');
        if (element.is(':visible')) element.slideUp(200);
        else element.slideDown(200);
    }

    /**
     * Open a documents sheet when clicking on it's link.
     * This is custom from FoundryVTT document links for mostly styling reasons (legacy).
     */
    static async _chatOpenDocumentLink(event) {
        const element = $(event.currentTarget);
        const uuid = element.data('uuid');
        if (!uuid) return console.error("Shadowrun 5e | A chat document link didn't provide a document UUID.");
        const document = await fromUuid(uuid);
        if (!document) return console.error("Shadowrun 5e | A chat document links UUID couldn't be resolved to a document.")

        // @ts-ignore
        await document?.sheet.render(true);
    }

    static async _castOpposedAction(event, cardHtml) {
        event.preventDefault();

        // Collect information needed to create the opposed action test.
        const messageId = cardHtml.data('messageId');
        const opposedActionTest = $(event.currentTarget).data('action');

        await this.fromMessageAction(messageId, opposedActionTest);
    }
}
