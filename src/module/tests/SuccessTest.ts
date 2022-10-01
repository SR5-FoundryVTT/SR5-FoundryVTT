import {SR5Actor} from "../actor/SR5Actor";
import {CORE_FLAGS, CORE_NAME, FLAGS, SR, SYSTEM_NAME} from "../constants";
import {DefaultValues} from "../data/DataDefaults";
import {Helpers} from "../helpers";
import {SR5Item} from "../item/SR5Item";
import {SR5Roll} from "../rolls/SR5Roll";
import {PartsList} from "../parts/PartsList";
import {TestDialog} from "../apps/dialogs/TestDialog";
import {SR5} from "../config";
import {ActionFlow} from "../item/flows/ActionFlow";
import ValueField = Shadowrun.ValueField;
import DamageData = Shadowrun.DamageData;
import OpposedTestData = Shadowrun.OpposedTestData;
import ModifierTypes = Shadowrun.ModifierTypes;
import ActionRollData = Shadowrun.ActionRollData;
import MinimalActionData = Shadowrun.MinimalActionData;
import ActionResultData = Shadowrun.ActionResultData;
import ResultActionData = Shadowrun.ResultActionData;
import {TestCreator} from "./TestCreator";
import Template from "../template";
import {TestRules} from "../rules/TestRules";

import {ActionResultFlow} from "../item/flows/ActionResultFlow";
import {handleRenderChatMessage} from "../chat";

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
    extendedHits: ValueField
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

    // Edge related triggers
    pushTheLimit: boolean
    secondChance: boolean

    // When true this test is an extended test
    extended: boolean

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
 * TODO: Remove edge related data from options. Only use options for general test related handling, not shadowrun interal stuff.
 */
export class SuccessTest {
    public data: SuccessTestData;
    public actor: SR5Actor | undefined;
    public item: SR5Item | undefined;
    public rolls: SR5Roll[];
    public evaluated: boolean;

    public targets: TokenDocument[];

    constructor(data, documents?: TestDocuments, options?: TestOptions) {
        // Store given documents to avoid later fetching.
        this.actor = documents?.actor;
        this.item = documents?.item;
        this.rolls = documents?.rolls || [];
        this.targets = [];
        this.evaluated = false;

        options = options || {}

        this.data = this._prepareData(data, options);

        this.calculateBaseValues();

        console.info(`Shadowrun 5e | Created ${this.constructor.name} Test`, this);
    }

    /**
     * Make sure a test has a complete data structure, even if supplied data doesn't fully provide that.
     *
     * Any Test should be usable simply by instantiating it with empty TestData
     *
     * @param data
     * @param options
     */
    _prepareData(data, options: TestOptions) {
        data.type = data.type || this.type;

        // Store the current users targeted token ids for later use.
        // @ts-ignore // undefined isn't allowed but excluded.
        data.targetActorsUuid = data.targetActorsUuid || Helpers.getUserTargets().map(token => token.actor?.uuid).filter(uuid => !!uuid);

        // Store given document uuids to be fetched during evaluation.
        data.sourceActorUuid = data.sourceActorUuid || this.actor?.uuid;
        data.sourceItemUuid = data.sourceItemUuid || this.item?.uuid;

        // @ts-ignore // Prepare general test information.
        data.title = data.title || this.constructor.label;

        // @ts-ignore // In FoundryVTT core settings we shall trust.
        options.rollMode = options.rollMode !== undefined ? options.rollMode : game.settings.get(CORE_NAME, CORE_FLAGS.RollMode);
        options.showDialog = options.showDialog !== undefined ? options.showDialog : true;
        options.showMessage = options.showMessage !== undefined ? options.showMessage : true;

        // Options will be used when a test is reused further on.
        data.options = options;

        data.pushTheLimit = data.pushTheLimit !== undefined ? data.pushTheLimit : false;
        data.secondChance = data.secondChance !== undefined ? data.secondChance : false;

        // Set possible missing values.
        data.pool = data.pool || DefaultValues.valueData({label: 'SR5.DicePool'});
        data.threshold = data.threshold || DefaultValues.valueData({label: 'SR5.Threshold'});
        data.limit = data.limit || DefaultValues.valueData({label: 'SR5.Limit'});

        data.values = data.values || {};

        // Prepare basic value structure to allow an opposed tests to access derived values before execution with placeholder
        // active tests.
        data.values.hits = data.values.hits || DefaultValues.valueData({label: "SR5.Hits"});
        data.values.extendedHits = data.values.extendedHits || DefaultValues.valueData({label: "SR5.ExtendedHits"});
        data.values.netHits = data.values.netHits || DefaultValues.valueData({label: "SR5.NetHits"});
        data.values.glitches = data.values.glitches || DefaultValues.valueData({label: "SR5.Glitches"});

        data.opposed = data.opposed || undefined;
        data.modifiers = this._prepareModifiers(data.modifiers);

        data.damage = data.damage || DefaultValues.damageData();

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
     * Get a possible globally defined default action set for this test class.
     */
    static _getDefaultTestAction(): Partial<MinimalActionData> {
        return {};
    }

    /**
     * Get a document defined action set for this test class.
     *
     * Subclasses can use this to provide actor or item based action configurations that aren't
     * directly part of the action template.
     *
     * @param item The item holding the action configuration.
     * @param actor The actor used for value calculation.
     */
    static async _getDocumentTestAction(item: SR5Item, actor: SR5Actor): Promise<Partial<MinimalActionData>> {
        return {};
    }

    static async _prepareActionTestData(action: ActionRollData, actor: SR5Actor, data) {
        return TestCreator._prepareTestDataWithAction(action, actor, data);
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
    static async _getOpposedActionTestData(testData, actor: SR5Actor, previousMessageId: string): Promise<SuccessTestData | undefined> {
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
        let pool = this.pool.mod.filter(mod => mod.value !== 0).map(mod => `${game.i18n.localize(mod.name)} (${mod.value})`); // Dev code for pool display. This should be replaced by attribute style value calculation info popup
        // let pool = this.pool.mod.map(mod => `${game.i18n.localize(mod.name)} (${mod.value})`);

        // Threshold and Limit are values that can be overwritten.
        let threshold = this.threshold.override
            ? [game.i18n.localize(this.threshold.override.name)]
            : this.threshold.mod.map(mod => game.i18n.localize(mod.name));
        let limit = this.limit.override
            ? [game.i18n.localize(this.limit.override.name)]
            : this.limit.mod.map(mod => game.i18n.localize(mod.name));


        // Add action static value modifiers as numbers.
        if (this.pool.base > 0) pool.push(String(this.pool.base));
        if (this.threshold.base > 0 && !this.threshold.override) threshold.push(String(this.threshold.base));
        if (this.limit.base > 0 && !this.limit.override) limit.push(String(this.limit.base));

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
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/success-test-dialog.html';
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
        await this.saveUserSelectionAfterDialog();

        // Second base value preparation will show changes due to user input.
        this.prepareBaseValues();
        this.calculateBaseValues();

        return true;
    }

    /**
     * Override this method if you want to save any document data after a user has selected values
     * during user facing dialog.
     */
    async saveUserSelectionAfterDialog() {}

    /**
     * Allow sub-classes to alter the base value calculation.
     * 
     * This can be used to dynamically alter action calculation before anything else.
     */
    alterBaseValues() {}

    /**
     * Overwrite this method if you need to alter base values.
     */
    prepareBaseValues() {
        this.applyPushTheLimit();
        this.applyPoolModifiers();
    }

    /**
     * Handle chosen modifier types and apply them to the pool modifiers.
     * 
     * NOTE: To keep this.pool.mod and this.modifiers.mod in sync, never remove
     *       a modifier. Rather set it to zero, causing it to not be shown.
     */
    applyPoolModifiers() {
        const pool = new PartsList(this.pool.mod);

        // Remove override modifier from pool.
        pool.removePart('SR5.Labels.Action.Modifiers');

        // If applicable apply only override to pool. (User interaction)
        if (this.data.modifiers.override) {
            // Remove all modifiers and only apply override.
            for (const modifier of this.data.modifiers.mod) {
                pool.removePart(modifier.name);
            }

            pool.addUniquePart('SR5.Labels.Action.Modifiers', this.data.modifiers.override.value)
            return;
        }

        // Otherwise apply automated modifiers to pool.
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

        this.evaluated = true;
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
        if (!this.actor && this.data.sourceActorUuid) {
            // SR5Actor.uuid will return an actor id for linked actors but its token id for unlinked actors
            const document = await fromUuid(this.data.sourceActorUuid) || undefined;
            // @ts-ignore
            this.actor = document instanceof TokenDocument ?
                document.actor :
                document as SR5Actor;
        }
        if (!this.item && this.data.sourceItemUuid)
            this.item = await fromUuid(this.data.sourceItemUuid) as SR5Item || undefined;
        if (this.targets.length === 0 && this.data.targetActorsUuid) {
            this.targets = [];
            for (const uuid of this.data.targetActorsUuid) {
                const document = await fromUuid(uuid);
                if (!document) continue;

                const token = document instanceof SR5Actor ? document.getToken() : document;
                if (!(token instanceof TokenDocument)) continue;

                this.targets.push(token as TokenDocument);
            }
        }
    }

    /**
     * Prepare missing data based on tests Documents before anything else is done.
     */
    async prepareDocumentData() {
        // Calculate damage here to have access to actor AND item used.
        this.data.damage = ActionFlow.calcDamage(this.data.damage, this.actor, this.item);
    }

    /**
     * What modifiers should be used for this test type by default.
     *
     * NOTE: These modifiers are routed through ModifierFlow.totalFor()
     */
    get testModifiers() {
        return ['global', 'wounds'];
    }

    /**
     * Prepare modifiers based on connected documents.
     *
     * Main purpose is to populate the configured modifiers for this test based on actor / items used.
     */
    async prepareDocumentModifiers()  {
        await this.prepareActorModifiers();
        await this.prepareItemModifiers();
    }

    /**
     * Prepare general modifiers based on the actor, as defined within the action or test implementation.
     */
    async prepareActorModifiers() {
        if (!this.actor) return;
        // Don't use default test actions when source action provides modifiers.
        if (this.data.action.modifiers.length > 0) return;

        for (const type of this.testModifiers) {
            const value = await this.actor.modifiers.totalFor(type);
            const name = SR5.modifierTypes[type];

            PartsList.AddUniquePart(this.data.modifiers.mod, name, value, true);
        }
    }

    /**
     * Allow subclasses to alter test modifiers based on the item used for casting.
     */
    async prepareItemModifiers() {}

    /**
     * Calculate the total of all values.
     */
    calculateDerivedValues() {
        // Calculate all derived / static values. Order is important.
        this.data.values.hits = this.calculateHits();
        this.data.values.extendedHits = this.calculateExtendedHits();
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
     *
     * NOTE: Limits will NEVER apply when the ApplyLimit setting is set accordingly.
     */
    get hasLimit(): boolean {
        const applyLimit = game.settings.get(SYSTEM_NAME, FLAGS.ApplyLimits) as boolean;
        return applyLimit && !this.hasPushTheLimit && this.limit.value > 0;
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
        // An extended test will use summed up extended hit, while a normal test will use its own hits.
        const hits = this.extended ? this.extendedHits : this.hits;

        // Maybe lower hits by threshold to get the actual net hits.
        const base = this.hasThreshold ?
            Math.max(hits.value - this.threshold.value, 0) :
            hits.value;

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

    get extendedHits(): ValueField {
        // Return a default value field, for when no extended hits have been derived yet (or ever).
        return this.data.values.extendedHits || DefaultValues.valueData({label: 'SR5.ExtendedHits'});
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

    /**
     * Gather hits across multiple extended test executions.
     */
    calculateExtendedHits(): ValueField {
        if (!this.extended) return DefaultValues.valueData({label: 'SR5.ExtendedHits'});

        const extendedHits = this.extendedHits;
        extendedHits.mod = PartsList.AddPart(extendedHits.mod, 'SR5.Hits', this.hits.value);

        Helpers.calcTotal(extendedHits, {min: 0});

        return extendedHits;
    }

    /**
     * Helper to check if this test is currently being extended.
     */
    get extended(): boolean {
        return this.canBeExtended && this.data.extended;
    }

    /**
     * Can this test type be extended or not?
     *
     * If false, will hide extended dialog settings.
     */
    get canBeExtended(): boolean {
        return true;
    }

    get glitches(): ValueField {
        return this.data.values.glitches;
    }

    /**
     * Helper to check if the current test state is glitched.
     */
    get glitched(): boolean {
        return TestRules.glitched(this.glitches.value, this.pool.value);
    }

    /**
     * Helper to check if the current test state is critically glitched.
     */
    get criticalGlitched(): boolean {
        return TestRules.criticalGlitched(this.success, this.glitched);
    }

    /**
     * Check if the current test state is successful.
     * 
     * @returns true on a successful test
     */
    get success(): boolean {
        // Extended tests use the sum of all extended hits.
        const hits = this.extended ? this.extendedHits : this.hits;
        return TestRules.success(hits.value, this.threshold.value);
    }

    /**
     * Check if the current test state is unsuccessful.
     * 
     * @returns true on a failed test
     */
    get failure(): boolean {
        // Allow extended tests without a threshold and avoid 'failure' confusion.
        if (this.extended && this.threshold.value === 0) return true;
        // When extendedHits have been collected, check against threshold.
        if (this.extendedHits.value > 0 && this.threshold.value > 0) return this.extendedHits.value < this.threshold.value;
        // Otherwise fall back to 'whatever is not a success.
        return !this.success;
    }

    /**
     * Use this method for subclasses which can't reasonably be successful.
     */
    get canSucceed(): boolean {
        // Not extended tests can succeed normally.
        if (!this.extended) return true;

        // Extended tests can only succeed when a threshold is set.
        return this.extended && this.hasThreshold;
    }

    /**
     * Use this method for subclasses which can't reasonably fail.
     */
    get canFail(): boolean {
        return true;
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
        if (this.extended) return 'SR5.Results';
        return 'SR5.Failure';
    }

    /**
     * Helper to check if opposing tests exist for this test.
     */
    get opposed(): boolean {
        return !!this.data.opposed && this.data.opposed.test !== '';
    }

    /**
     * Determine if this test is opposing another test.
     */
    get opposing(): boolean {
        return false;
    }

    /**
     * Helper to get an items action result information.
     */
    get results(): ActionResultData|undefined {
        if (!this.item) return;
        return this.item.getActionResult();
    }

    /**
     * Determine if this test has any targets selected using FoundryVTT targeting.
     */
    get hasTargets(): boolean {
        return this.targets.length > 0;
    }

    /**
     * Has this test been derived from an action?
     *
     * This can either be from an items action or a pre-configured action.
     */
    get hasAction(): boolean {
        //@ts-ignore // TODO: foundry-vtt-types v10
        return !foundry.utils.isEmpty(this.data.action);
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
        return this.data.pushTheLimit;
    }

    get hasSecondChance(): boolean {
        return this.data.secondChance;
    }

    /**
     * Handle Edge rule 'push the limit'.
     * 
     * If called without push the limit, all modifiers for it will be removed.
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
     * Handle Edge rules for 'second chance'.
     * 
     * If called without second chance, all modifiers for it will be removed.
     */
    applySecondChance() {
        if (!this.actor) return;

        const parts = new PartsList(this.pool.mod);

        if (this.hasSecondChance) {
            // According to rules, second chance can't be used on glitched tests.
            if (this.glitched) {
                ui.notifications?.warn('SR5.Warnings.CantSecondChanceAGlitch', {localize: true});
                return this;
            }

            // Only count last roll as there might be multiple second chances already
            const lastRoll = this.rolls[this.rolls.length - 1];
            const dice = lastRoll.poolThrown - lastRoll.hits;
            if (dice <= 0) {
                ui.notifications?.warn('SR5.Warnings.CantSecondChanceWithoutNoneHits', {localize: true});
                return this;
            }

            // Apply second chance modifiers.
            const parts = new PartsList(this.pool.mod);
            // Second chance can stack, so don't add it as unique.
            parts.addPart('SR5.SecondChance', dice);

            // Add new dice as fully separate Roll.
            const formula = `${dice}d6`;
            const roll = new SR5Roll(formula);
            this.rolls.push(roll);

        } else {
            parts.removePart('SR5.SecondChance');
        }
    }

    /**
     * Handle Edge rule 'second chance' within this test according to SR5#56
     */
    async executeSecondChance(): Promise<this> {
        console.log(`Shadowrun 5e | ${this.constructor.name} will apply second chance rules`);

        if (!this.data.sourceActorUuid) return this;

        // According to rules, second chance can't be used on glitched tests.
        if (this.glitched) {
            ui.notifications?.warn('SR5.Warnings.CantSecondChanceAGlitch', {localize: true});
            return this;
        }

        // Fetch documents.
        await this.populateDocuments();

        //  Trigger edge consumption.
        this.data.secondChance = true;
        this.applySecondChance();

        // Can't use normal #execute as not all parts are needed.        
        this.calculateBaseValues();

        const actorConsumedResources = await this.consumeDocumentRessoucesWhenNeeded();
        if (!actorConsumedResources) return this;
        
        // Remove second chance to avoid edge consumption on any kind of re-rolls.
        this.data.secondChance = false;

        await this.evaluate();
        await this.processResults();
        await this.toMessage();
        await this.afterTestComplete();

        return this;
    }

    /**
     * Make sure ALL ressources needed are available.
     * 
     * This is checked before any ressources are consumed.
     * 
     * @returns true when enough ressources are available to consume
     */
    canConsumeDocumentRessources(): boolean {
        // No actor present? Nothing to consume...
        if (!this.actor) return true;
        
        // Edge consumption.
        if (this.hasPushTheLimit || this.hasSecondChance) {      
            if (this.actor.getEdge().uses <= 0) {
                ui.notifications?.error(game.i18n.localize('SR5.MissingRessource.Edge'));
                return false;
            }
        }

        return true;
    }

    /**
     * Handle resulting resource consumption caused by this test.
     * 
     * @return true when the ressources could be consumed in appropriate ammounts.
     */
    async consumeDocumentRessources(): Promise<boolean> {
        if (!this.actor) return true;

        // Edge consumption.
        if (this.hasPushTheLimit || this.hasSecondChance) {            
            await this.actor.useEdge();
        }

        return true;
    }

    /**
     * Consume ressources according to whats configured for this world.
     
    * @returns true when the test can process
     */
    async consumeDocumentRessoucesWhenNeeded(): Promise<boolean> {
        const mustHaveRessouces = game.settings.get(SYSTEM_NAME, FLAGS.MustHaveRessourcesOnTest);
        // Make sure to nest canConsume to avoid unneccessary warnings.
        if (mustHaveRessouces) {
            if (!this.canConsumeDocumentRessources()) return false;
        }

        return await this.consumeDocumentRessources();
    }

    /**
     * Executing a test will start all behaviours necessary to:
     * - Calculate its values
     * - Show and handle a user facing test dialog
     * - Render and show a resulting test message
     * - Evaluate all it's roles and consumption of items used
     * - Trigger resulting methods for all results, including success and failure
     *
     * Implementing classes should seek to change out methods used here, or within those methods, to alter test
     * behaviour to their needs.
     *
     * When execute methods promise resolves this test and its chain is completed.
     *
     * NOTE: Currently none of these methods trigger Foundry hooks.
     */
    async execute(): Promise<this> {
        await this.populateTests();
        await this.populateDocuments();
        await this.prepareDocumentModifiers();
        await this.prepareDocumentData();

        this.alterBaseValues();

        // Initial base value preparation will show default result without any user input.
        this.prepareBaseValues();
        this.calculateBaseValues();

        // Allow user to change details.
        const userConsented = await this.showDialog();
        if (!userConsented) return this;

        // Check if actor has all needed resources to even test.
        const actorConsumedResources = await this.consumeDocumentRessoucesWhenNeeded();
        if (!actorConsumedResources) return this;

        this.createRoll();

        await this.evaluate();
        await this.processResults();
        await this.toMessage();
        await this.afterTestComplete();

        return this;
    }

    /**
     * Allow subclasses to override behaviour after a test has finished.
     *
     * This can be used to alter values after a test is over.
     */
    async processResults() {
        if (this.success) {
            await this.processSuccess();
        } else {
            await this.processFailure();
        }
    }

    /**
     * Allow subclasses to override behaviour after a successful test result.
     *
     * This can be used to alter values after a test succeeded.
     * @override
     */
    async processSuccess() {}

    /**
     * Allow subclasses to override behaviour after a failure test result
     *
     * This can be used to alter values after a test failed.
     * @override
     */
    async processFailure() {}

    /**
     * Allow subclasses to override behaviour after a test is fully done. This will be called after processResults
     * and allows for additional processes to be triggered that don't affect this test itself.
     *
     * This can be used to trigger other processes like followup tests or saving values.
     */
    async afterTestComplete() {
        console.log(`Shadowrun5e | Test ${this.constructor.name} completed.`, this);

        if (this.success) {
            await this.afterSuccess();
        } else {
            await this.afterFailure();
        }

        await this.executeFollowUpTest();

        if (this.extended) {
            await this.extendCurrentTest();
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
     * Depending on the action configuration execute a followup test.
     */
    async executeFollowUpTest() {
        const test = await TestCreator.fromFollowupTest(this, this.data.options);
        if (!test) return;
        await test.execute();
    }

    /**
     * Should this test be an extended test, re-execute it until it can't be anymore.
     */
    async extendCurrentTest() {
        if (!this.canBeExtended) return;

        const data = foundry.utils.duplicate(this.data);
        // No extension possible, if test type / class is unknown.
        if (!data.type) return;

        // Apply the extended modifier according the current iteration
        const pool = new PartsList(data.pool.mod);

        const currentModifierValue = pool.getPartValue('SR5.ExtendedTest') || 0;
        const nextModifierValue = TestRules.calcNextExtendedModifier(currentModifierValue);

        // Reduce either user override or default value.
        if (data.pool.override) {
            data.pool.override.value = Math.max(data.pool.override.value - 1, 0);
        } else {
            pool.addUniquePart('SR5.ExtendedTest', nextModifierValue);
        }

        Helpers.calcTotal(data.pool, {min: 0});

        if (!TestRules.canExtendTest(data.pool.value, this.threshold.value, this.extendedHits.value)) {
            return ui.notifications?.warn('SR5.Warnings.CantExtendTestFurther', {localize: true});
        }

        const testCls = TestCreator._getTestClass(data.type);
        if (!testCls) return;
        const test = new testCls(data, {actor: this.actor, item: this.item}, this.data.options);

        await this.populateDocuments();

        // Remove previous edge usage.
        test.data.pushTheLimit = false;
        test.applyPushTheLimit();
        test.data.secondChance = false;
        test.applySecondChance();

        // Should this test not have been extended yet, prepare it to be an extended test.
        if (!test.extended) {
            test.data.extended = true;
            test.calculateExtendedHits();
        }

        // In case the previous test used edge, remove those modifiers.

        await test.execute();
    }

    /**
     * DiceSoNice must be implemented locally to avoid showing dice on gmOnlyContent throws while also using
     * FoundryVTT ChatMessage of type roll for their content visibility behaviour.
     * 
     * https://gitlab.com/riccisi/foundryvtt-dice-so-nice/-/wikis/Integration
     */
    async rollDiceSoNice() {
        // @ts-ignore
        if (!game.dice3d || !game.user || !game.users) return;

        console.log('Shadowrun5e | Initiating DiceSoNice throw');

        // Only roll the last dice rolled.
        // This necessary when a test has been recast with second chance, and should only the re-rolled dice instead
        // of all.
        const roll = this.rolls[this.rolls.length - 1];

        // Limit users to show dice to...
        let whisper: User[]|null = null;
        // ...for gmOnlyContent check permissions
        if (this._applyGmOnlyContent && this.actor) {
            // @ts-ignore
            whisper = game.users.filter(user => this.actor?.testUserPermission(user, 'OWNER'));
        }
        // ...for rollMode include GM when GM roll
        if (this.data.options?.rollMode === 'gmroll' || this.data.options?.rollMode === "blindroll") {
            whisper = whisper || [];
            whisper = [...game.users.filter(user => user.isGM), ...whisper];
        }

        // Don't show dice to a user casting blind.
        const blind = this.data.options?.rollMode === 'blindroll';
        const synchronize = this.data.options?.rollMode === 'publicroll';

        // @ts-ignore
        game.dice3d.showForRoll(roll, game.user, synchronize, whisper, blind, this.data.messageUuid);
    }

    /**
     * Post this success test as a message to the chat log.
     */
    async toMessage(): Promise<ChatMessage | undefined> {
        if (!this.data.options?.showMessage) return;

        // Prepare message content.
        const templateData = this._prepareMessageTemplateData();
        const content = await renderTemplate(this._chatMessageTemplate, templateData);
        // Prepare the actual message.
        const messageData = this._prepareMessageData(content);
        const options = {rollMode: this._rollMode};

        //@ts-ignore // TODO: foundry-vtt-types v10
        const message = await ChatMessage.create(messageData, options);

        if (!message) return;

        // Store message id for future use.
        this.data.messageUuid = message.uuid;

        await this.rollDiceSoNice();

        return message;
    }

    /**
     * Prepare chat message content data for this success test card.
     *
     * @returns Chat Message template data.
     *
     * TODO: Add template data typing.
     */
    _prepareMessageTemplateData() {
        // Either get the linked token by collection or synthetic actor.
        // Unlinked collection actors will return multiple tokens and can't be resolved to a token.
        const linkedTokens = this.actor?.getActiveTokens(true) || [];
        const token = linkedTokens.length >= 1 ? linkedTokens[0] : undefined;

        return {
            title: this.data.title,
            test: this,
            // Note: While ChatData uses ids, this uses full documents.
            speaker: {
                actor: this.actor,
                token: token
            },
            item: this.item,
            opposedActions: this._prepareOpposedActionsTemplateData(),
            resultActions: this._prepareResultActionsTemplateData(),
            previewTemplate: this._canPlaceBlastTemplate,
            showDescription: this._canShowDescription,
            description: this.item?.getChatData() || '',
            // Some message segments are only meant for the gm, when the gm is the one creating the message.
            // When this test doesn't use an actor, don't worry about hiding anything.
            applyGmOnlyContent: this._applyGmOnlyContent
        }
    }

    /**
     * Indicate if this test can be used to show the item description.
     */
    get _canShowDescription(): boolean {
        return true;
    }

    /**
     * Indicate if this test can be used to place a blast template using the shown chat message.
     *
     * This is indicated by the source items ability to cause an area of effect blast and which kind
     * of test is used.
     */
    get _canPlaceBlastTemplate(): boolean {
        return this.item?.hasTemplate || false;
    }

    /**
     * This test should hide information / rolls / dice for when cast by the GM.
     */
    get _applyGmOnlyContent(): boolean {
        // Enable GM only content only when the global setting is set.
        const enableFeature = game.settings.get(SYSTEM_NAME, FLAGS.HideGMOnlyChatContent) as boolean;

        return enableFeature && !!game.user && game.user.isGM && !!this.actor;
    }

    /**
     * This class should be used for the opposing test implementation.
     */
    get _opposedTestClass(): any|undefined {
        if (!this.data.opposed || !this.data.opposed.test) return;
        return TestCreator._getTestClass(this.data.opposed.test);
    }

    /**
     * Prepare opposed test action buttons.
     *
     * Currently, one opposed action is supported, however the template
     * is prepared to support multiple action buttons.
     */
    _prepareOpposedActionsTemplateData() {
        const testCls = this._opposedTestClass;
        // No opposing test configured. Nothing to build.
        if (!testCls) return [];

        const action = {
            // Store the test implementation registration name.
            test: testCls.name,
            label: testCls.label
        };

        // Show the flat dice pool modifier on the chat action.
        if (this.data.opposed.mod) {
            action.label += ` ${this.data.opposed.mod}`;
        }

        return [action]
    }

    /**
     * Prepare result action buttons
     */
    _prepareResultActionsTemplateData(): ResultActionData[] {
        const actions: ResultActionData[] = [];
        const actionResultData = this.results;
        if (!actionResultData) return actions;

        if (actionResultData.success.matrix.placeMarks) {
            actions.push({
                action: 'placeMarks',
                label: 'SR5.PlaceMarks',
                value: ''
            });
        }

        return actions;
    }

    /**
     * What ChatMessage rollMode is this test supposed to use?
     */
    get _rollMode(): string {
        return this.data.options?.rollMode as string ?? game.settings.get('core', 'rollmode');
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

        const formula = `0d6`;
        const roll = new SR5Roll(formula);
        // evaluation is necessary for Roll DataModel validation.
        roll.evaluate({async: false});
        
        const messageData = {
            user: game.user?.id,
            // Use type roll, for Foundry built in content visibility.
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            speaker: {
                actor,
                alias,
                token
            },
            roll,
            content,
            // Manually build flag data to give renderChatMessage hook flag access.
            // This test data is needed for all subsequent testing based on this chat messages.
            flags: {
                [SYSTEM_NAME]: {[FLAGS.Test]: this.toJSON()},
                'core.canPopout': true
            },
            sound: CONFIG.sounds.dice,            
        }

        // Instead of manually applying whisper ids, let Foundry do it.
        // @ts-ignore TODO: Types Provide propper SuccessTestData and SuccessTestOptions
        ChatMessage.applyRollMode(messageData, this._rollMode);

        return messageData;
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
    static async chatMessageListeners(message: ChatMessage, html, data) {
        html.find('.show-roll').on('click', this._chatToggleCardRolls);
        html.find('.show-description').on('click', this._chatToggleCardDescription);
        html.find('.chat-document-link').on('click', Helpers.renderEntityLinkSheet);
        html.find('.place-template').on('click', this._placeItemBlastZoneTemplate);
        html.find('.result-action').on('click', this._castResultAction);
        html.find('.chat-select-link').on('click', this._selectSceneToken);

        handleRenderChatMessage(message, html, data);

        await this._showGmOnlyContent(message, html, data)
    }

    static async _showGmOnlyContent(message: ChatMessage, html, data) {
        const test = await TestCreator.fromMessage(message.id as string);
        if (!test) return;
        await test.populateDocuments();

        // SuccessTest doesn't NEED an actor, if one is cast that way: show gm-only-content
        if (!test.actor || !game.user) {
            html.find('.gm-only-content').removeClass('gm-only-content');
        }
        else if (game.user.isGM || game.user.isTrusted || test.actor?.isOwner) {
            html.find('.gm-only-content').removeClass('gm-only-content');
        }
    }

    /** 
     * Select a Token on the current scene based on the link id.
     * @params event Any user PointerEvent
    */
    static async _selectSceneToken(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!game || !game.ready || !canvas || !canvas.ready) return;

        const selectLink = $(event.currentTarget);
        const tokenId = selectLink.data('tokenId');
        const token = canvas.tokens?.get(tokenId);

        if (token && token instanceof Token) {
            token.control();
        } else {
            ui.notifications?.warn(game.i18n.localize('SR5.NoSelectableToken'))
        }
    }

    static async chatLogListeners(chatLog: ChatLog, html, data) {
        // setup chat listener messages for each message as some need the message context instead of chatlog context.
        html.find('.chat-message').each(async (index, element) => {
            element = $(element);
            const id = element.data('messageId');
            const message = game.messages?.get(id);
            if (!message) return;

            await this.chatMessageListeners(message, element, message.toObject())
        });
    }

    /**
     * Items with an area of effect will allow users to place a measuring template matching the items blast values.
     *
     * @param event A PointerEvent triggered from anywhere within the chat-card
     */
    static async _placeItemBlastZoneTemplate(event) {
        event.preventDefault();
        event.stopPropagation();

        // Get test data from message.
        const element = $(event.currentTarget);
        const card = element.closest('.chat-message');
        const messageId = card.data('messageId');
        const test = await TestCreator.fromMessage(messageId);
        if (!test) return;

        // Get item used in test
        await test.populateDocuments();

        // Place template based on last used spell force for the item.
        if (!test.item) return;
        const template = Template.fromItem(test.item);
        if (!template) return;
        await template.drawPreview();
    }

    /**
     * Foundry ChatMessage context options (right click) used for all test types.
     * @param html
     * @param options
     */
    static chatMessageContextOptions(html, options) {
        const secondChance = async (li) => {
            const messageId = li.data().messageId;
            const test = await TestCreator.fromMessage(messageId);
            if (!test) return console.error('Shadowrun 5e | Could not restore test from message');

            await test.executeSecondChance();
        };

        const extendTest = async (li) => {
            const messageId = li.data().messageId;
            const test = await TestCreator.fromMessage(messageId);
            if (!test) return console.error('Shadowrun 5e | Could not restore test from message');

            // @ts-ignore
            if (!test.canBeExtended) {
                return ui.notifications?.warn('SR5.Warnings.CantExtendTest', {localize: true});
            }

            await test.extendCurrentTest();
        };

        const deleteOption = options.pop();

        options.push({
            name: game.i18n.localize('SR5.SecondChance'),
            callback: secondChance,
            condition: true,
            icon: '<i class="fas fa-meteor"></i>'
        });

        options.push({
            name: game.i18n.localize('SR5.Extend'),
            callback: extendTest,
            condition: true,
            icon: '<i class="fas fa-clock"></i>'
        })

        options.push(deleteOption);

        return options;
    }

    /**
     * By default, roll results are hidden in a chat card.
     *
     * This will hide / show them, when called with a card event.
     *
     * @param event Called from within a card html element.
     */
    static async _chatToggleCardRolls(event) {
        event.preventDefault();
        event.stopPropagation();

        const card = $(event.currentTarget).closest('.chat-card');
        const element = card.find('.dice-rolls');
        if (element.is(':visible')) element.slideUp(200);
        else element.slideDown(200);
    }

    /**
     * By default, item descriptions are hidden in a chat card.
     *
     * This will hide / show them, when called with a card event.
     * @param event A PointerEvent triggered anywhere from within a chat-card
     */
    static async _chatToggleCardDescription(event) {
        event.preventDefault();
        event.stopPropagation();

        const card = $(event.currentTarget).closest('.chat-card');
        const element = card.find('.card-description');
        if (element.is(':visible')) element.slideUp(200);
        else element.slideDown(200);
    }

    /**
     * A test message initiated an action for a test result, extract information from message and execute action.
     *
     * @param event A PointerEvent by user-interaction
     */
    static async _castResultAction(event) {
        event.preventDefault();
        event.stopPropagation();

        const element = $(event.currentTarget)
        const resultAction = element.data('action');

        const messageId = element.closest('.chat-message').data('messageId');
        const test = await TestCreator.fromMessage(messageId);
        
        if (!test) return console.error(`Shadowrun5e | Couldn't find both a result action ('${resultAction}') and extract test from message ('${messageId}')`);
        
        await test.populateDocuments();
        await ActionResultFlow.executeResult(resultAction, test);
    }
}
