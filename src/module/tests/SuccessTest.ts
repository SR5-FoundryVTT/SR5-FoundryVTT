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
import {TestCreator} from "./TestCreator";
import Template from "../template";
import {TestRules} from "../rules/TestRules";
import ActionResultData = Shadowrun.ActionResultData;
import {ActionResultFlow} from "../item/flows/ActionResultFlow";

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

        // Without further rules applied just use the general action damage configuration.
        // This damage can be further altered using process* methods.
        const damage = this.data.action ? this.data.action.damage : DefaultValues.damageData();
        this.data.damage = ActionFlow.calcDamage(damage, this.actor);

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
     * Prepare missing data based on this tests Documents before anything else is done.
     */
    async prepareDocumentData() {}

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
     * Helper to check if the current test state is successful.
     *
     * Since a test can only really be a success when some threshold is met,
     * only report success when there is one.
     */
    get success(): boolean {
        // Either use this tests current hits or use the extended tests summed up hits.
        const hits = this.extended ? this.extendedHits : this.hits;
        return TestRules.success(hits.value, this.threshold.value);
    }

    /**
     * Helper to check if the current test state is unsuccessful.
     */
    get failure(): boolean {
        return !this.success;
    }

    /**
     * Use this method for subclasses which can't reasonably be successful.
     */
    get canSucceed(): boolean {
        return true;
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
     * Determine if this test provides any results
     */
    get hasResults(): boolean {
        if (!this.item) return false;
        const actionResultData = this.item.getActionResult();
        if (!actionResultData) return false;
        return !foundry.utils.isObjectEmpty(actionResultData);
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
    async executeSecondChance() {
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

        await this.populateDocuments();
        this.calculateBaseValues();

        const formula = `${dice}d6`;
        const roll = new SR5Roll(formula);
        this.rolls.push(roll);

        await this.evaluate();
        await this.processResults();
        await this.toMessage();
        await this.afterTestComplete();
    }

    /**
     * Handle resulting actor resource consumption after this test.
     *
     * TODO: Maybe make this a hook and transfer resources to consume (edge, ammo)
     */
    async consumeActorResources(): Promise<boolean> {
        // No actor present? Nothing to consume...
        if (!this.actor) return true;

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
        const data = foundry.utils.duplicate(this.data);
        // No extension possible, if test type / class is unknown.
        if (!data.type) return;

        // Apply the extended modifier according the current iteration
        const pool = new PartsList(data.pool.mod);

        const currentModifierValue = pool.getPartValue('SR5.ExtendedTest') || 0;
        const nextModifierValue = TestRules.calcNextExtendedModifier(currentModifierValue);

        pool.addUniquePart('SR5.ExtendedTest', nextModifierValue);

        Helpers.calcTotal(data.pool, {min: 0});

        if (TestRules.canExtendTest(data.pool.value, this.threshold.value, this.extendedHits.value)) {
            const testCls = TestCreator._getTestClass(data.type);
            if (!testCls) return;
            const test = new testCls(data, {actor: this.actor, item: this.item}, this.data.options);
            await test.execute();
        }
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
        const message = await ChatMessage.create(messageData);

        if (!message) return;

        // Store message id for future use.
        this.data.messageUuid = message.uuid;

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
            opposedActions: this._prepareOpposedActionsTemplateData(),
            resultActions: this._prepareResultActionsTemplateData(),
            previewTemplate: this._canPlaceBlastTemplate,
            showDescription: this._canShowDescription,
            description: this.item?.getChatData() || '',
            // Some message segments are only meant for the gm, when the gm is the one creating the message.
            applyGmOnlyContent: game.user?.isGM,
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
     * Prepare opposed test action buttons.
     *
     * Currently, one opposed action is supported, however the template
     * is prepared to support multiple action buttons.
     */
    _prepareOpposedActionsTemplateData() {
        if (!this.data.opposed || !this.data.opposed.test) return [];

        // @ts-ignore TODO: Move this into a helper
        const testCls = game.shadowrun5e.tests[this.data.opposed.test];
        if (!testCls) return console.error('Shadowrun 5e | Opposed Action has no test class registered.')

        const action = {
            // Store the test implementation registration name.
            test: this.data.opposed.test,
            label: testCls.label
        };

        if (this.data.opposed.mod) {
            action.label += ` ${this.data.opposed.mod}`;
        }

        return [action]
    }

    /**
     * Prepare result action buttons
     */
    _prepareResultActionsTemplateData(): {action: string, label: string}[] {
        const actions: {action: string, label: string}[] = [];
        const actionResultData = this.results;
        if (!actionResultData) return actions;

        if (actionResultData.success.matrix.placeMarks) {
            actions.push({
                action: 'placeMarks',
                label: 'SR5.PlaceMarks'
            });
        }

        return actions;
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
            rollMode: this.data.options?.rollMode,
            // Manually build flag data to give renderChatMessage hook flag access.
            // This test data is needed for all subsequent testing based on this chat messages.
            flags: {
                [SYSTEM_NAME]: {[FLAGS.Test]: this.toJSON()}
            }
        }

        // Instead of manually applying whisper ids, let Foundry do it.
        // @ts-ignore TODO: Types Provide propper SuccessTestData and SuccessTestOptions
        ChatMessage.applyRollMode(messageData, this.data.options?.rollMode);

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

        await this._showGmOnlyContent(message, html, data)
    }

    static async _showGmOnlyContent(message: ChatMessage, html, data) {
        const test = await TestCreator.fromMessage(message.id as string);
        if (!test) return;
        await test.populateDocuments();
        if (!test.actor || !game.user) return;

        if (game.user.isGM || game.user.isTrusted || test.actor?.isOwner) {
            html.find('.gm-only-content').removeClass('gm-only-content');
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

        await ActionResultFlow.executeResult(resultAction, test);
    }
}
