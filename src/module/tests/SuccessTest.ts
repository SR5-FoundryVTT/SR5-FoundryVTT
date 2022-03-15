import { SR5Actor } from "../actor/SR5Actor";
import {SR, SYSTEM_NAME, FLAGS, CORE_NAME, CORE_FLAGS} from "../constants";
import { DefaultValues } from "../data/DataDefaults";
import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";
import {SR5Roll} from "../rolls/SR5Roll";
import ValueField = Shadowrun.ValueField;
import DamageData = Shadowrun.DamageData;
import OpposedTestData = Shadowrun.OpposedTestData;
import {PartsList} from "../parts/PartsList";
import {ShadowrunTestDialog} from "../apps/dialogs/ShadowrunTestDialog";
import {OpposedTest} from "./OpposedTest";
import {TestDialog} from "../apps/dialogs/TestDialog";
import GenericValueField = Shadowrun.GenericValueField;

export interface TestDocuments {
    actor?: SR5Actor
    item?: SR5Item
    rolls?: SR5Roll[]
}

export interface TestValues {
    pushTheLimit: GenericValueField
    secondChance: GenericValueField

    [name: string]: ValueField|DamageData
}

export interface SuccessTestValues extends TestValues {
    hits: ValueField
    netHits: ValueField
    glitches: ValueField
}

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

    values: TestValues


    // Documents the test might has been derived from.
    sourceItemUuid?: string
    sourceActorUuid?: string

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
    public actor: SR5Actor|undefined;
    public item: SR5Item|undefined;
    public rolls: SR5Roll[];

    public targets: TokenDocument[]

    static CHAT_TEMPLATE = 'systems/shadowrun5e/dist/templates/rolls/success-test.html';

    // TODO: include modifiers
    // TODO: store options in data for later re roll with same options?
    constructor(data, documents?: TestDocuments, options?: TestOptions) {
        // TODO: Move roll to documents (or name it context)

        // Store given documents to avoid later fetching.
        this.actor = documents?.actor;
        this.item = documents?.item;
        this.rolls = documents?.rolls || [];
        this.targets = [];

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
    _prepareData(data, options?: TestOptions) {
        data.type = data.type || this.constructor.name;

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
        options.showMessage = options.showMessage || true;

        // Options will be used when a test is reused further on.
        data.options = options;

        // Set possible missing values.
        data.pool = data.pool || DefaultValues.valueData({label: 'SR5.DicePool'});
        data.threshold = data.threshold || DefaultValues.valueData({label: 'SR5.Threshold'});
        data.limit = data.limit || DefaultValues.valueData({label: 'SR5.Limit'});

        data.values = data.values || {
            pushTheLimit: DefaultValues.valueData({label: "SR5.PushTheLimit"}),
            secondChange: DefaultValues.valueData({label: 'SR5.SecondChange'})
        }
        data.opposed = data.opposed || undefined;

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
    static fromAction(item: SR5Item, actor?: SR5Actor, options?: TestOptions): SuccessTest|undefined {
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
        const data = cls.getItemActionTestData(item, actor);

        return new cls(data, {item, actor}, options);
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
    static fromPool(values?: {pool?: number, limit?: number, threshold?: number}, options?: TestOptions): SuccessTest {
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
        return this.fromTestData(testData.data, documents,{});
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
            const data = testClass.getMessageActionTestData(testData.data, actor, id);
            if (!data) return;

            const rolls = testData.rolls.map(roll => SR5Roll.fromData(roll as any));
            const documents = {actor, rolls};
            const test = new testClass(data, documents);
            // TODO: Doesn't ask for dialog. Should be based on options...
            await test.execute();
        }
    }

    toJSON() {
        return {data: this.data,
                rolls: this.rolls};
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
    static getItemActionTestData(item: SR5Item, actor: SR5Actor) {
        // Prepare general data structure with labeling.
        const data = {
            pool: DefaultValues.valueData({label: 'SR5.DicePool'}),
            limit: DefaultValues.valueData({label: 'SR5.Limit'}),
            threshold: DefaultValues.valueData({label: 'SR5.Threshold'}),
            opposed: {}
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
        if (action.threshold.base) {
            data.threshold.base = Number(action.threshold.base);
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
     */
    get formula(): string {
        const pool = Helpers.calcTotal(this.data.pool);
        const explode = this.hasPushTheLimit ? 'x6' : '';

        return `(${pool})d6cs>=${SuccessTest.lowestSuccessSide}${explode}`;
    }

    /**
     * Give a representation of this success test in the common Shadowrun 5 description style.
     *
     * Automatics + Agility + 3 (3) [2 + Physical]
     */
    get code(): string {
        // Add action dynamic value sources as labels.
        const pool = this.pool.mod.map(mod => game.i18n.localize(mod.name));
        const threshold = this.threshold.mod.map(mod => game.i18n.localize(mod.name));
        const limit = this.limit.mod.map(mod => game.i18n.localize(mod.name));

        // Add action static value modifiers as numbers.
        if (this.pool.base > 0) pool.push(String(this.pool.base));
        if (this.threshold.base > 0) threshold.push(String(this.threshold.base));
        if (this.limit.base > 0 ) limit.push(String(this.limit.base));

        // Pool portion can be dynamic or static.
        let code = pool.join(' + ') || `${this.pool.value}`;

        // Only add threshold / limit portions when appropriate.
        if (this.threshold.value > 0) code = `${code} (${threshold.join(' + ')})`;
        if (this.limit.value > 0) code = `${code} [${limit.join(' + ')}]`;

        return code;
    }

    /**
     * All parts of the test code can be dynamic, any will do.
     */
    get hasCode(): boolean {
        return this.pool.mod.length > 0 || this.threshold.mod.length > 0 || this.limit.mod.length > 0;
    }

    get title(): string {
        // @ts-ignore
        return `${game.i18n.localize(this.constructor.label)} (${this.code})`
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
     * What TestDialog class to use for this test type?
     *
     * @override This method if you want to use a different TestDialog.
     */
    _createTestDialog() {
        return new TestDialog(this);
    }

    /**
     * Show the dialog class for this test type and alter test according to user selection.
     */
    async showDialog(): Promise<boolean> {
        const dialog = this._createTestDialog();

        const data = await dialog.select();
        if (dialog.canceled) return false;

        // Overwrite current test state with whatever the dialog gives.
        this.data = data;

        return true;
    }

    /**
     * Calculate only the base test that can be calculated before the test has been evaluated.
     */
    calculateBaseValues() {
        this.data.pool.value = Helpers.calcTotal(this.data.pool, {min: 0});
        this.data.threshold.value = Helpers.calcTotal(this.data.threshold, {min: 0});
        this.data.limit.value = Helpers.calcTotal(this.data.limit, {min: 0});
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

        await this.populateDocuments();

        this.calculateValues();

        return this;
    }

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
     * Calculate the total of all values.
     */
    calculateValues() {
        this.calculateBaseValues();

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
                rollHits});
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

    get hasPushTheLimit(): boolean {
        return this.data.values.pushTheLimit.value === true;
    }
    /**
     * Handle Edge rule 'pushTheLimit' within this test.
     * TODO: Is this actually pushTheLimit or is it 'explode sixes?'
     * TODO: Maybe values.pushTheLimit isn't needed... just let the dialog call this
     */
    applyPushTheLimit() {
        if (!this.actor) return;

        const parts = new PartsList(this.pool.mod);

        if (this.hasPushTheLimit) {
            const edge = this.actor.getEdge().value;
            parts.addUniquePart('SR5.PushTheLimit', edge);
        } else {
            parts.removePart('SR5.PushTheLimit');
        }

        // Avoid subsequent calls of this test to also apply push the limit
        this.data.values.pushTheLimit.base = false;
    }

    /**
     * TODO: Documentation.
     */
    async applySecondChance() {
        console.log(`Shadowrun 5e | ${this.constructor.name} will apply second chance rules`);

        if (!this.data.sourceActorUuid) return;

        const dice = this.rolls.reduce((noneHits, roll) => noneHits + roll.pool - roll.hits, 0);
        if (dice === 0) return; // TODO: User info about no dice.;

        // Alter dice pool value for glitch calculation.
        this.pool.mod = PartsList.AddUniquePart(this.pool.mod, 'SR5.SecondChange', dice);
        this.calculateBaseValues();

        const formula = `${dice}d6`;
        const roll = new SR5Roll(formula);
        this.rolls.push(roll);

        await this.evaluate();
        await this.toMessage();
    }

    setSecondChance(active: boolean) {
        this.data.values.secondChance.base = active;
    }

    /**
     * Handle resulting actor resource consumption after this test.
     *
     * TODO: Maybe make this a hook and transfer resources to consume (edge, ammo)
     */
    async consumeActorResources() {
        if (!this.actor) return;

        if (this.hasPushTheLimit) {
            await this.actor.useEdge();
        }

        // TODO: Add second chance consumption
    }

    /**
     * TODO: Documentation.
     */
    async execute(): Promise<this> {
        if (this.data.options?.showDialog) {
            const userConsented = await this.showDialog();
            if (!userConsented) return this;
        }

        // Prepare current test state.
        this.applyPushTheLimit();

        const roll = this.createRoll();
        this.rolls = [roll];

        await this.evaluate();

        if (this.data.options?.showMessage) {
            await this.toMessage();
        }

        await this.consumeActorResources();

        return this;
    }

    /**
     * Post this success test as a message to the chat log.
     */
    async toMessage(): Promise<ChatMessage|undefined> {
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
