import { SR5Actor } from "../actor/SR5Actor";
import {SR, SYSTEM_NAME, FLAGS, CORE_NAME, CORE_FLAGS} from "../constants";
import { DefaultValues } from "../data/DataDefaults";
import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";
import {SR5Roll} from "../rolls/SR5Roll";
import ValueField = Shadowrun.ValueField;
import OpposedTestData = Shadowrun.OpposedTestData;
import {PartsList} from "../parts/PartsList";
import {ShadowrunTestDialog} from "../apps/dialogs/ShadowrunTestDialog";
import {OpposedTest} from "./OpposedTest";
import {TestDialog} from "../apps/dialogs/TestDialog";

export interface TestDocuments {
    actor?: SR5Actor,
    item?: SR5Item
}

// TODO: Separate types between SuccessTestData and parameter Data within constructor
export interface SuccessTestData {
    title?: string
    // TODO: implement typing method to apply effects to and for ations.
    // TODO: Show set of test types here
    type?: string

    // Shadowrun 5 related test values.
    // TODO: Think about moving these into general values. This would allow ActiveEffects to only target .values
    pool: ValueField
    threshold: ValueField
    limit: ValueField
    values: Record<string, ValueField>

    opposed?: OpposedTestData

    // Documents the test might have been derived from.
    sourceItemUuid?: string
    sourceActorUuid?: string

    // Scene Token Ids marked as targets of this test.
    targetActorsUuid?: string[]

    // Options the test was created with.
    options?: SuccessTestOptions
}

export interface SuccessTestOptions {
    showDialog?: boolean // Show dialog when defined as true.
    roll?: SR5Roll
    rollMode?: keyof typeof CONFIG.Dice.rollModes
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
    public actor: SR5Actor|undefined;
    public item: SR5Item|undefined;
    public roll: SR5Roll;

    public targets: TokenDocument[]

    static CHAT_TEMPLATE = 'systems/shadowrun5e/dist/templates/rolls/success-test.html';

    // TODO: include modifiers
    // TODO: store options in data for later re roll with same options?
    constructor(data: SuccessTestData, documents?: TestDocuments, options?: SuccessTestOptions) {
        // TODO: Move roll to documents (or name it context)
        const roll = options?.roll;
        if (options) delete options.roll;

        // Store given documents to avoid later fetching.
        this.actor = documents?.actor;
        this.item = documents?.item;
        this.targets = [];

        this.data = this._prepareData(data, options);

        // Reuse an old roll or create a new one.
        this.roll = roll || this.createRoll();

        console.info(`Shadowrun 5e | Created ${this.constructor.name} Test`, this);
    }

    /**
     * Prepare TestData
     *
     * @param data
     * @param options
     */
    _prepareData(data: SuccessTestData, options?: SuccessTestOptions) {
        // Store the current users targeted token ids for later use.
        // @ts-ignore // undefined isn't allowed but it's excluded.
        data.targetActorsUuid = data.targetActorsUuid || Helpers.getUserTargets().map(token => token.actor?.uuid).filter(uuid => !!uuid);

        // Store given document uuids to be fetched during evaluation.
        // TODO: Include all necessary sepaker / token info in SuccessTestData to allow items to be deleted.
        data.sourceActorUuid = data.sourceActorUuid || this.actor?.uuid;
        data.sourceItemUuid = data.sourceItemUuid || this.item?.uuid;

        // @ts-ignore // Prepare general test information.
        data.title = data.title || this.constructor.label;

        options = options || {}
        // @ts-ignore // In FoundryVTT core settings we shall trust.
        options.rollMode = options.rollMode || game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);
        options.showDialog = options.showDialog || true;

        // Options will be used when a test is reused further on.
        data.options = options;

        return data;
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
    static fromAction(item: SR5Item, actor?: SR5Actor, options?: SuccessTestOptions): SuccessTest|undefined {
        //@ts-ignore
        if (!actor) actor = item.parent;
        if (!(actor instanceof SR5Actor)) {
            console.error("Shadowrun 5e | A SuccessTest can only be created with an explicit Actor or Item with an actor parent.")
            return;
        }

        const action = item.getAction();
        if (!action) return;
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
        const data = cls.getItemActionTestData(item, actor);
        return new cls(data, {item, actor}, options);
    }

    /**
     * Helper method to create a SuccessTest from given data.
     *
     * @param data
     * @param documents
     * @param options
     */
    static fromTestData(data: SuccessTestData, documents?: TestDocuments, options?: SuccessTestOptions): SuccessTest {
        // Before used documents would be fetched during evaluation.
        return new SuccessTest(data, {}, options);
    }

    /**
     * A helper method to create a SuccessTest from a simple pool value, without
     * actor / item involvement.
     *
     * TODO: fromPool as a name for 'from values' doesn't quite describe the method anymore, since a pool doesn't need to be given.
     * @param values
     * @param options
     */
    static fromPool(values?: {pool?: number, limit?: number, threshold?: number}, options?: SuccessTestOptions): SuccessTest {
        const testData = {
            pool: DefaultValues.valueData({label: 'SR5.DicePool', base: values?.pool || 0}),
            threshold: DefaultValues.valueData({label: 'SR5.Threshold', base: values?.threshold || 0}),
            limit: DefaultValues.valueData({label: 'SR5.Limit', base: values?.limit || 0}),
            values: {}
        };

        return new SuccessTest(testData, undefined, options);
    }

    static fromMessage(id: string): SuccessTest|undefined {
        const message = game.messages?.get(id);
        if (!message) {
            console.error(`Shadowrun 5e | Couldn't find a message for id ${id} to create a message action`);
            return;
        }

        const testData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as SuccessTestData;
        if (!testData) {
            console.error(`Shadowrun 5e | Message with id ${id} doesn't have test data in it's flags.`);
            return;
        }

        const roll = message.roll as SR5Roll;
        return this.fromTestData(testData,{},{roll});
    }

    /**
     * TODO: Check if this method is still usefull when a dialog is an inbetween and not an initator of a test.
     */
    static async fromDialog(): Promise<SuccessTest|undefined> {
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
        const test = SuccessTest.fromPool({pool: pool.value, threshold: thresholdValue, limit: limitValue}, {showDialog: false});
        await test.toMessage();

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

        const testData = message.getFlag(SYSTEM_NAME, FLAGS.Test) as SuccessTestData;
        if (!testData) {
            console.error(`Shadowrun 5e | Message with id ${id} doesn't have test data in it's flags.`);
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

        //
        for (const actor of actors) {
            const data = testClass.getMessageActionTestData(testData, actor, id);
            if (!data) return;

            const test = new testClass(data, {actor}, {});
            // TODO: Doesn't ask for dialog. Should be based on options...
            await test.toMessage();
        }
    }

    toJSON() {
        return this.data;
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
    static getItemActionTestData(item: SR5Item, actor: SR5Actor): SuccessTestData {
        // Prepare general data structure with labeling.
        const data: SuccessTestData = {
            pool: DefaultValues.valueData({label: 'SR5.DicePool'}),
            limit: DefaultValues.valueData({label: 'SR5.Limit'}),
            threshold: DefaultValues.valueData({label: 'SR5.Threshold'}),
            values: {}
        };

        // Try fetching the items action data.
        const action = item.getAction();
        if (!action || !actor) return data;

        // Prepare pool values.
        // TODO: Check if knowledge / language skills can be used for actions.
        if (action.skill) {
            const skill = actor.getSkill(action.skill);
            if (skill) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, skill.label, skill.value, false);
            // TODO: Check if this is actuall skill specialization and for a +2 config for it instead of MagicValue.
            if (action.spec) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, 'SR5.Specialization', 2);
        }
        // The first attribute is either used for skill or attribute only tests.
        if (action.attribute) {
            const attribute = actor.getAttribute(action.attribute);
            if (attribute) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, attribute.label, attribute.value, false);
        }
        // The second attribute is only used for attribute only tests.
        if (!action.skill && action.attribute2) {
            const attribute = actor.getAttribute(action.attribute2);
            if (attribute) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, attribute.label, attribute.value, false);
        }
        if (action.mod) {
            data.pool.base = Number(action.mod);
        }

        // Prepare limit values...
        if (action.limit.attribute) {
            const limit = actor.getLimit(action.limit.attribute);
            if (limit) data.limit.mod = PartsList.AddUniquePart(data.limit.mod, limit.label, limit.value, false);
        }
        if (action.limit.base || action.limit.value) {
            data.limit.base = Number(action.limit.value);
        }

        // Prepare threshold values...
        if (action.threshold.base || action.threshold.value) {
            data.threshold.base = Number(action.threshold.value);
        }

        // Prepare opposed tests...
        if (action.opposed.type) {
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
    static getMessageActionTestData(testData, actor: SR5Actor, previousMessageId: string): SuccessTestData|undefined {
        console.error(`Shadowrun 5e | Testing Class ${this.name} doesn't support opposed message actions`);
        return;
    }

    static get label(): string {
        return `SR5.Tests.${this.name}`;
    }

    /**
     * Create a Shadowrun 5 pool formula which will count all hits.
     *
     * FoundryVTT documentation:
     *  Dice:       https://foundryvtt.com/article/dice-advanced/
     *  Modifiers:  https://foundryvtt.com/article/dice-modifiers/
     * Shadowrun5e: SR5#44
     *
     * TODO: If edge is used use the rr6 modifier
     */
    get formula(): string {
        const pool = Helpers.calcTotal(this.data.pool);
        return `(${pool})d6cs>=${SuccessTest.lowestSuccessSide}`;
    }

    /**
     * Helper method to create the internal SR5Roll.
     * @private
     */
    private createRoll(): SR5Roll {
        // TODO: Add typing for rolls?
        // @ts-ignore
        return new SR5Roll(this.formula) as unknown as SR5Roll;
    }

    /**
     * Show the dialog class for this test type and alter test according to user selection.
     */
    async showDialog(): Promise<boolean> {
        const dialog = new TestDialog(this);

        const data = await dialog.select();
        if (dialog.canceled) return false;

        this.data = data;

        return true;
    }

    /**
     * Helper method to evaluate the internal SR5Roll and SuccessTest values.
     *
     */
    async evaluate(): Promise<SuccessTest> {
        // @ts-ignore // foundry-vtt-types is missing _evaluated.
        if (!this.roll._evaluated)
            await this.roll.evaluate({async: true});

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

        this.calculateValues();

        return this;
    }

    calculateValues() {
        this.data.pool.value = Helpers.calcTotal(this.data.pool, {min: 0});
        this.data.threshold.value = Helpers.calcTotal(this.data.threshold, {min: 0});
        this.data.limit.value = Helpers.calcTotal(this.data.limit, {min: 0});

        this.data.values.hits = this.calculateHits();
        this.data.values.netHits = this.calculateNetHits();
        this.data.values.glitches = this.calculateGlitches();

        // Calculate all dynamics values.
        Object.values(this.data.values).forEach(field => {
            // It's likely that most fields will lower out at zero.
            field.value = Helpers.calcTotal(field, {min: 0})
        });
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
        return this.limit.value > 0;
    }

    /**
     * Helper to determine if the hits have been lowered by the limit.
     *
     * This will compare actual roll hits, without applied limit.
     */
    get hasReducedHits(): boolean {
        return this.roll.hits > this.limit.value;
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
        const hits = DefaultValues.valueData({
            label: "SR5.Hits",
            base: this.hasLimit ?
                Math.min(this.limit.value, this.roll.hits) :
                this.roll.hits});
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
        const glitches = DefaultValues.valueData({
            label: "SR5.Glitches",
            base: this.roll.glitches
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
        return this.roll.glitched;
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
        return this.hasThreshold && this.netHits.value > 0;
    }

    /**
     * Helper to check if the current test state is unsuccessful.
     *
     * Since a test can only really be a failure when some threshold isn't met,
     * only support failure when there is one.
     */
    get failure(): boolean {
        return this.hasThreshold && this.netHits.value === 0;
    }

    /**
     * Helper to check if opposing tests exist for this test.
     */
    get opposed(): boolean {
        return this.data.opposed !== undefined;
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

    /**
     * Post this success test as a message to the chat log.
     */
    async toMessage(): Promise<ChatMessage|undefined> {
        if (this.data.options?.showDialog) {
            const userConsented = await this.showDialog();
            if (!userConsented) return;
        }

        await this.evaluate();

        // Prepare message content.
        const templateData = this._prepareTemplateData();
        const content = await renderTemplate(SuccessTest.CHAT_TEMPLATE, templateData);
        // Prepare the actual message.
        const messageData = this._prepareMessageData(content);
        const message = await ChatMessage.create(messageData);

        // Prepare reuse of test data on subsequent tests after this one.
        await message?.setFlag(SYSTEM_NAME, FLAGS.Test, this.toJSON());

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
            roll: this.roll,
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
            // Be carefull not to reference the OpposedTest class due to circular imports.
            console.warn(`Shadowrun 5e | An opposed action without a defined test handler defaulted to ${'OpposedTest'}`);
            this.data.opposed.test = 'OpposedTest';
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

        const { opposed } = this.data;
        switch (this.data.opposed) {}
        if (opposed.type !== 'custom') {
            action.label = `${Helpers.label(opposed.type)}`;
        } else if (opposed.skill) {
            action.label = `${Helpers.label(opposed.skill)}+${Helpers.label(opposed.attribute)}`;
        } else if (opposed.attribute2) {
            action.label = `${Helpers.label(opposed.attribute)}+${Helpers.label(opposed.attribute2)}`;
        } else if (opposed.attribute) {
            action.label = `${Helpers.label(opposed.attribute)}`;
        }

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

        const messageData = {
            user: game.user?.id,
            speaker: {
                actor,
                alias,
                token
            },
            content,
            // TODO: Do we need this roll serialization since test is serialized into the message flat?
            roll: JSON.stringify(this.roll.toJSON()),
            rollMode: this.data.options?.rollMode
        }

        // Instead of manually applying whisper ids, let Foundry do it.
        // @ts-ignore TODO: Types Provide propper SuccessTestData and SuccessTestOptions
        ChatMessage.applyRollMode(messageData, this.data.options?.rollMode);

        return messageData;
    }

    static async _testDataFromMessage(id: string): Promise<SuccessTestData|undefined> {
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
        html.find('.card-main-content').on('click', (event) => SuccessTest._chatToggleCardRolls(event, html));
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

    static async _castOpposedAction(event, cardHtml) {
        event.preventDefault();

        // Collect information needed to create the opposed action test.
        const messageId = cardHtml.data('messageId');
        const opposedActionTest = $(event.currentTarget).data('action');

        await SuccessTest.fromMessageAction(messageId, opposedActionTest);
    }
}
