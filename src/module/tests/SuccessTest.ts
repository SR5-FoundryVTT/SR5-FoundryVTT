import { SR5 } from "../config";
import { Helpers } from "../helpers";
import { SR5Die } from "../rolls/SR5Die";
import { SR5Item } from "../item/SR5Item";
import { SR5Roll } from "../rolls/SR5Roll";
import { TestCreator } from "./TestCreator";
import { SR5Actor } from "../actor/SR5Actor";
import { TestRules } from "../rules/TestRules";
import type { ExtendedTestInterval } from '../types/flows/ExtendedTest';
import { ModifiableValue } from "../mods/ModifiableValue";
import { DataDefaults } from "../data/DataDefaults";
import { ActionFlow } from "../item/flows/ActionFlow";
import { CORE_NAME, FLAGS, SYSTEM_NAME } from "../constants";
import { TestDialog, TestDialogListener } from "../apps/dialogs/TestDialog";

import ModifierTypes = Shadowrun.ModifierTypes;

import { SuccessTestEffectsFlow } from '../effect/flows/SuccessTestEffectsFlow';
import { SR5ActiveEffect } from '../effect/SR5ActiveEffect';
import { Translation } from '../utils/strings';
import { GmOnlyMessageContentFlow } from '../actor/flows/GmOnlyMessageContentFlow';
import { ActionResultType, ActionRollType, DamageType, MinimalActionType, OpposedTestType, ResultActionType } from '../types/item/Action';
import { ValueFieldType } from '../types/template/Base';
import { DeepPartial } from "fvtt-types/utils";
import type { FlowStep } from '../types/flows/FlowStep';
import { FlowRunner } from '../flows/FlowRunner';
import { ChatMessageContextOption, TestChatFlow, ValueModifierTooltipOptions } from './flows/TestChatFlow';
import { TestFeature, TestFeatureOutcome, TestFeatureRules } from './features/TestFeature';
import { FlowSubjectDocument, FlowSubjects } from '../flows/FlowSubjects';
import { TestMode, TestModes, TestPipelineStage } from './TestMode';
export interface TestDocuments {
    // Legacy field that used be the source document.
    actor?: SR5Actor
    // The action document the action has been taken from
    item?: SR5Item
    // The main document values have been taken from
    source?: SR5Actor | SR5Item
    // Rolls already taken for this test.
    rolls?: SR5Roll[]
}

export type TestValues = Record<string, ValueFieldType | DamageType>
export type SuccessTestValues = TestValues & {
    hits: ValueFieldType
    netHits: ValueFieldType
    glitches: ValueFieldType
    extendedHits: ValueFieldType
}

export interface SuccessTestCodeTermTrace {
    valueField: ValueFieldType;
    tooltipSource: string;
}

export interface SuccessTestCodeTerm {
    text: string;
    valueText?: string;
    tooltipSource?: string;
}

/**
 * Contain all data necessary to handle an action based test.
 */
export interface TestData {
    // How to label this test.
    title?: string
    // Determine the kind of test; defaults to the class constructor name.
    type?: string

    // Shadowrun 5 related test values.
    pool: ValueFieldType
    threshold: ValueFieldType
    limit: ValueFieldType

    // Use Shadowrun buy hits rule instead of rolling dice.
    buyHits: boolean

    autoSuccess?: boolean

    // Internal test values.
    values: TestValues

    damage: DamageType

    // A list of test categories to be used for this test.
    // Check typing documentation for more information.
    categories: Shadowrun.ActionCategories[]

    // Edge related triggers
    pushTheLimit: boolean
    secondChance: boolean

    // When true this test is an extended test
    extended: boolean
    // When false, this test is on it's first roll. When true, it's on an extended roll.
    extendedRoll: boolean
    // The interval between extended test rolls. A value above zero marks this test as extended.
    extendedInterval: ExtendedTestInterval
    // The managed extended test record this roll belongs to, if any. See ExtendedTestFlow.
    extendedManagedId?: string

    // The source action this test is derived from.
    action: ActionRollType

    // Documents the test might has been derived from.
    sourceItemUuid?: string
    sourceActorUuid?: string
    
    // The document test values have been taken from. This can be both actor and item.
    sourceUuid?: string
    sourceIsActor?: boolean

    // Message the test has been represented with.
    messageUuid?: string

    // Optional term-level provenance used for formula/code hover tooltips.
    codeTermTraces?: SuccessTestCodeTermTrace[]

    // Options the test was created with.
    options: TestOptions

    // Feature changes for this single test, prefixed with + to add or - to remove. See TestFeature.
    features?: string[]

    // The root of a chain started without rolling, like using a drug. See FlowRunner.startChain.
    rollless?: boolean

    // Actor uuids that assisted this test, like teamwork assistants or ritual participants.
    participantUuids?: string[]

    // Has this test been cast before
    evaluated: boolean
}

export interface SuccessTestData extends TestData {
    opposed: OpposedTestType
    values: SuccessTestValues
    // Scene Token Ids marked as targets of this test.
    targetActorsUuid: string[]
    targetUuids: string[]
}

export interface TestOptions {
    showDialog: boolean
    showMessage: boolean
    rollMode: ChatMessage.Mode
}

export interface SuccessTestMessageData {
    data: SuccessTestData,
    rolls: ReturnType<SR5Roll['toJSON']>[]
}

/**
 * General handling of Shadowrun 5e success tests as well as their FoundryVTT representation.
 *
 * SuccessTest implementation will handle
 * - general flow of a FoundryVTT Shadowrun 5e success test
 * - shadowrun 5e rules
 * - FoundryVTT dialog creation for user input
 * - FoundryVTT chat message creation
 *
 * Usage:
 * > const test = new SuccessTest({pool: 6});
 * > await test.execute();
 * 
 * The user facing point for a success test is the execute() method.
 * It's up to the caller to decide what parameters to give.
 * 
 * Check the TestCreator helper for more convenient ways to create tests from
 * - actions (data)
 * - items
 * - existing chat messages
 * - ...
 * 
 * Create a test from an item:
 * > const test = await TestCreator.fromItem(item);
 * > test.execute();
 * 
 * Typically the system will create a test from an action. Each action contains a reference
 * for the active, opposed, resist and follow up test to use. That test will be taken by the
 * TestCreate._getTestClass() function. Whenever a user trigger test is to be executed, it should 
 * be an action configuration that is used to retrieve and create the test.
 * 
 * The test registry is a simple key value store mapping names to classes underneath
 * game.shadowrun5e.tests
 * 
 * For the default SuccessTest class the registry entry would look like this:
 * > game.shadowrun5e.tests['SuccessTest'] = SuccessTest;
 * and it would be retrieved by the TestCreator like this:
 * > const SuccessTest = TestCreate._getTestClass('SuccessTest');
 */
export class SuccessTest<T extends SuccessTestData = SuccessTestData> {
    public data: T;
    public actor: SR5Actor | undefined;
    public item: SR5Item | undefined;
    public source: SR5Actor | SR5Item | undefined;

    public rolls: SR5Roll[];
    // Targets can be either actor/item or a token.
    public targets: (SR5Actor | SR5Item | TokenDocument)[];
    public dialog: TestDialog | null;

    // Flows to handle different aspects of a Success Test that are not directly related to the test itself.
    public effects: SuccessTestEffectsFlow<this>;

    public ignoreUserPermission: boolean;

    // Stands in for a failure label when the test can't name an outcome, as extended tests can't.
    static readonly NO_VERDICT_LABEL: Translation = 'SR5.TestResults.Results';

    /**
     * Ids of the features this test kind uses. See TestFeature.
     */
    static features: string[] = [];

    /**
     * Default tests of action nodes added below a node using this test, by relation key.
     * Like a defense test below an attack, or drain below a spell.
     */
    static flowDefaults: Record<string, string> = {};

    /**
     * Relation keys this test can be used for in action nodes, besides those its registry gives.
     * See FlowNodeEditorFlow.tests.
     */
    static flowRoles: string[] = [];

    // Which feature ran in which stage, for debugging. Not stored.
    public featureTrace: { stage: string, feature: string }[] = [];

    // Allow this.constructor to not reference Function.
    declare ['constructor']: typeof SuccessTest;

    static applyStructuralDefaults<T extends DeepPartial<SuccessTestData>>(data: T): T & SuccessTestData {
        data.buyHits ??= false;
        data.pushTheLimit ??= false;
        data.secondChance ??= false;

        data.pool ||= DataDefaults.createData('value_field', { label: 'SR5.DicePool' });
        data.threshold ||= DataDefaults.createData('value_field', { label: 'SR5.Threshold' });
        data.limit ||= DataDefaults.createData('value_field', { label: 'SR5.Limit' });

        data.values ||= {};
        data.opposed ||= {} as OpposedTestType;
        data.codeTermTraces ??= [];

        data.values.hits ||= DataDefaults.createData('value_field', { label: "SR5.Hits" });
        data.values.extendedHits ||= DataDefaults.createData('value_field', { label: "SR5.ExtendedHits" });
        data.values.netHits ||= DataDefaults.createData('value_field', { label: "SR5.NetHits" });
        data.values.glitches ||= DataDefaults.createData('value_field', { label: "SR5.Glitches" });

        data.action ||= DataDefaults.createData('action_roll');
        data.damage ||= DataDefaults.createData('damage');

        data.categories ||= [];
        data.targetActorsUuid ||= [];
        data.evaluated ??= false;
        data.extended ??= false;
        data.extendedRoll ??= false;
        data.extendedInterval ??= { value: 0, unit: 'minutes' };

        return data as T & SuccessTestData;
    }

    constructor(data: DeepPartial<T>, documents?: TestDocuments, options: Partial<TestOptions> = {}) {
        // Store given documents to avoid later fetching.
        this.actor = documents?.actor;
        this.item = documents?.item;
        // If no specific source document is given, fallback to actor.
        this.source = documents?.source ?? documents?.actor;
        this.rolls = documents?.rolls || [];

        // User selected targets of this test.
        this.targets = [];

        this.data = this._prepareData(data, options);
        for (const feature of this.features) feature.prepareData?.(this);

        this.effects = new SuccessTestEffectsFlow<this>(this);
        this.ignoreUserPermission = false;

        this.calculateBaseValues();

        this.dialog = null;

        console.debug(`Shadowrun 5e | Created ${this.constructor.name} Test`, this);
    }

    /**
     * Make sure a test has a complete data structure, even if supplied data doesn't fully provide that.
     *
     * Any Test should be usable simply by instantiating it with empty TestData
     */
    _prepareData(data: DeepPartial<T>, options: Partial<TestOptions>): T {
        const prepared: SuccessTestData = SuccessTest.applyStructuralDefaults(data);
        prepared.type ??= this.type;

        // Store the current users targeted token ids for later use.
        prepared.targetUuids ||= Helpers.getUserTargets().map(token => token.actor?.uuid).filter((uuid): uuid is string => !!uuid);

        // Store given document uuids to be fetched during evaluation.
        prepared.sourceActorUuid ||= this.actor?.uuid ?? undefined;
        prepared.sourceItemUuid ||= this.item?.uuid ?? undefined;
        prepared.sourceUuid ||= this.source?.uuid ?? undefined;

        prepared.title ||= this.constructor.label;

        // Options will be used when a test is reused further on.
        prepared.options = {
            rollMode: this._prepareRollMode(prepared, options),
            showDialog: options.showDialog ?? true,
            showMessage: options.showMessage ?? true,
        };

        console.debug('Shadowrun 5e | Prepared test data', prepared);

        return prepared as T;
    }

    /**
     * The tests roll mode can be given by specific option, action setting or global configuration.
     * @param options The test options for the whole test
     */
    _prepareRollMode(data: DeepPartial<SuccessTestData>, options: Partial<TestOptions>): ChatMessage.Mode {
        if (options.rollMode != null) return options.rollMode;
        if (data?.action?.roll_mode) return data.action.roll_mode as ChatMessage.Mode;
        else return game.settings.get(CORE_NAME, 'messageMode') as ChatMessage.Mode;
    }

    /**
     * Overwrite this method to alter the title of test dialogs and messages.
     */
    get title(): string {
        return `${game.i18n.localize(this.constructor.label)}`;
    }

    /**
     * Determine the type of success test for this implementation.
     * 
     * By default this will be the class constructor name. 
     * NOTE: This breaks for a build pipeline using minification. This is due to
     * , currently, the test registry using the runtime constructor name vs the compile time
     * class name.
     */
    get type(): string {
        return this.constructor.name;
    }

    /**
     * Get the label for this test type used for i18n.
     */
    static get label(): Translation {
        return `SR5.Tests.${this.name}` as Translation;
    }

    /**
     * Helper to determine if this test has been fully evaluated at least once.
     */
    get evaluated(): boolean {
        return this.data.evaluated;
    }

    /**
     * FoundryVTT serializer method to embed this test into a document (ChatMessage).
     * 
     * Foundry expects Roll data to serialize into rolls.
     * The system expects Test data to serialize into data.
     */
    toJSON() {
        return {
            data: this.data,
            // Use Roll.toJSON() to inject 'class' property. Foundry relies on this to build it's classes.
            rolls: this.rolls.map(roll => roll.toJSON())
        };
    }

    /**
     * Get a possible globally defined default action set for this test class.
     */
    static _getDefaultTestAction(): DeepPartial<MinimalActionType> {
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
    static _getDocumentTestAction(_item: SR5Item, _actor: SR5Actor): DeepPartial<MinimalActionType> {
        return {};
    }

    static _prepareActionTestData(action: ActionRollType, document: SR5Actor | SR5Item, data: SuccessTestData, againstData?: SuccessTestData) {
        return TestCreator._prepareTestDataWithAction(action, document, data, againstData);
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
    // oxlint-disable-next-line typescript/require-await -- Async hook that subclasses override with awaiting implementations.
    static async _getOpposedActionTestData(_testData: DeepPartial<SuccessTestData>, _actor: SR5Actor|SR5Item, _previousMessageId: string): Promise<SuccessTestData | undefined> {
        console.error(`Shadowrun 5e | Testing Class ${this.name} doesn't support opposed message actions`);
        return undefined;
    }

    // oxlint-disable-next-line typescript/require-await -- Async hook that subclasses override with awaiting implementations.
    static async _getResistActionTestData(_testData: DeepPartial<SuccessTestData>, _actor: SR5Actor|SR5Item, _previousMessageId: string): Promise<SuccessTestData | undefined> {
        console.error(`Shadowrun 5e | Testing Class ${this.name} doesn't support resist message actions`);
        return undefined;
    }

    /**
     * Create the default formula for this test based on it's pool
     *
     * FoundryVTT documentation:
     * Shadowrun5e: SR5#44
     */
    get formula(): string {
        const pool = ModifiableValue.calcTotal(this.data.pool, { min: 0 });
        return this.buildFormula(pool, this.hasPushTheLimit);
    }

    /**
     * Build a Foundry Roll formula string
     * 
     * Dice:       https://foundryvtt.com/article/dice-advanced/
     * Modifiers:  https://foundryvtt.com/article/dice-modifiers/
     * 
     * @param dice Amount of ds to use.
     * @param explode Should the ds be exploded.
     * @returns The complete formula string.
     */
    buildFormula(dice: number, explode: boolean): string {
        // Build the dice formula for a Shadowrun 5e test.
        // - dice: number of ds (custom die) to roll
        // - explode: whether to explode sixes (Edge rules)

        const explodeModifier = explode ? 'x6' : '';
        return `${dice}d${SR5Die.DENOMINATION}${explodeModifier}`;
    }

    /**
     * Determine if this test can have a human-readable shadowrun test code representation.
     *
     * All parts of the test code can be dynamic, any will do.
     */
    get hasCode(): boolean {
        const codeTerms = this.codeTerms;
        return codeTerms.pool.length > 0 || codeTerms.limit.length > 0 || codeTerms.threshold.length > 0;
    }

    /**
     * Resolves the individual components and the human-readable representation of this success test.
     * Provides the formatted UI terms for the test's pool, limit, and threshold. 
     * Additionally, generates the common Shadowrun 5 description string (e.g., "Automatics + Agility + 3 [2 + Physical] (3)")
     * to provide information about value sources.
     *
     * @returns An object containing the term arrays (`pool`, `limit`, `threshold`), the formatted `description` string.
     */
    get codeTerms() {
        return {
            pool: this._buildCodeTermsForField(this.pool),
            limit: this._buildCodeTermsForField(this.limit),
            threshold: this._buildCodeTermsForField(this.threshold),
        };
    }

    /** Find a traced breakdown by its change name and value. */
    traceSourceForChange(change: ValueFieldType['changes'][number]): string | undefined {
        const traces = this.data.codeTermTraces ?? [];

        // The last matching trace is the most recently updated one.
        return traces.findLast(trace =>
            trace.valueField.label === change.name && trace.valueField.value === change.value
        )?.tooltipSource;
    }

    /** Build rulebook-style formula terms; totals are shown separately. */
    private _buildCodeTermsForField(valueField: ValueFieldType): SuccessTestCodeTerm[] {
        const terms: SuccessTestCodeTerm[] = [];

        for (const change of valueField.changes.filter(change => ModifiableValue.isBaseChange(change))) {
            terms.push({
                text: game.i18n.localize(change.name as Translation),
                valueText: String(change.value),
                tooltipSource: this.traceSourceForChange(change),
            });
        }

        if (valueField.base)
            terms.push({ text: String(valueField.base) });

        return terms;
    }

    /**
     * Helper method to create the main SR5Roll.
     */
    createRoll(): SR5Roll {
        const roll = new SR5Roll(this.formula);
        this.rolls.push(roll);
        return roll;
    }

    /**
     * Allow other implementations to override what TestDialog template to use.
     */
    get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/success-test-dialog.hbs';
    }

    /**
     * Allow other implementations to override what ChatMessage template to use.
     */
    get _chatMessageTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/rolls/success-test-message.hbs';
    }

    /**
     * What TestDialog class to use for this test type?
     *
     * If you only need to display differing data you can also only define a different _dialogTemplate
     * @override This method if you want to use a different TestDialog.
     */
    _createTestDialog() {
        return new TestDialog(this, this._testDialogListeners());
    }

    /**
     * Allow other implementations to add listeners to the TestDialog HTML, changing
     * it's behavior without the need to sub-class TestDialog.
     */
    _testDialogListeners() {
        return [] as TestDialogListener[];
    }

    /**
     * Suppress dialog during execution
     */
    hideDialog() {
        this.data.options.showDialog = false;
    }

    /**
     * Show the dialog class for this test type and alter test according to user selection.
     */
    async showDialog(): Promise<boolean> {
        if (!this.data.options.showDialog) return true;

        this.dialog = this._createTestDialog();

        const data = await this.dialog.select();
        if (this.dialog.canceled) {
            await this._cleanUpAfterDialogCancel();
            return false
        }

        // Overwrite current test state with whatever the dialog gives.
        this.data = data as unknown as T;

        // Provide entry points with dialog data.
        await this._cleanUpAfterDialog();
        await this.saveUserSelectionAfterDialog();

        // Second base value preparation will show changes due to user input.
        this.prepareBaseValues();
        this.calculateBaseValues();

        return true;
    }

    /** 
     * Override this method if there needs to be some cleanup after a user has canceled a dialog 
     * but before the tests actual execution.
     */
    // oxlint-disable-next-line typescript/require-await -- Async hook that subclasses override with awaiting implementations.
    async _cleanUpAfterDialogCancel() {
        this.dialog = null;
    }

    /**
     * Allow implementations to clean up after a dialog has been shown.
     */
    async _cleanUpAfterDialog() { }

    /**
     * Override this method if you want to save any document data after a user has selected values
     * during user facing dialog.
     */
    async saveUserSelectionAfterDialog() { }

    /**
     * The general base value preparation. This will be re applied at multiple points before execution.
     */
    prepareBaseValues() {
        // Re-apply document modifiers first, as those might have changed in between calculations.
        this.prepareDocumentModifiers();
        this.prepareTestModifiers();
        for (const feature of this.features) feature.prepareTestModifiers?.(this);

        // Only then apply values and collected modifiers.
        this.applyPushTheLimit();
        this.applyPoolModifiers();

        this.runFeatureValues();

        Hooks.call('sr5_testPrepareBaseValues', this);
    }

    /**
     * Handle chosen modifier types and apply them to the pool modifiers.
     * 
     * NOTE: To keep this.pool.mod and this.modifiers.mod in sync, never remove
     *       a modifier. Rather set it to zero, causing it to not be shown.
     */
    applyPoolModifiers() {
        const pool = new ModifiableValue(this.pool);

        // Remove override modifier from pool.
        pool.remove('SR5.Labels.Action.Modifiers');
    }

    /**
     * To assure all test values are full integers, round all value parts.
     * Don't round the total as this will lead to some values shown as decimals and some as 
     * integers.
     * 
     * Instead Shadowrun 5e rules expect all individual values to be rounded before use.
     * We use the 'Note on Rounding' on SR5#48 as a guideline.
     */
    roundBaseValueParts() {
        const roundAllMods = (value: ValueFieldType) => {
            value.base = Math.ceil(value.base);
            for (const change of value.changes)
                change.value = Math.ceil(change.value);
        }

        roundAllMods(this.data.pool);
        roundAllMods(this.data.threshold);
        roundAllMods(this.data.limit);
    }

    /**
     * Calculate only the base test that can be calculated before the test has been evaluated.
     * 
     * This will be re applied at multiple points before execution.
     */
    calculateBaseValues() {
        this.roundBaseValueParts();

        ModifiableValue.calcTotal(this.data.pool, { min: 0 });
        ModifiableValue.calcTotal(this.data.threshold, { min: 0 });
        ModifiableValue.calcTotal(this.data.limit, { min: 0 });

        // Shows AP on incoming attacks
        ModifiableValue.calcTotal(this.data.damage.ap);

        console.debug(`Shadowrun 5e | Calculated base values for ${this.constructor.name}`, this.data);
    }

    /**
     * Allow implementations to validate values before execution.
     */
    validateBaseValues() { }

    /**
     * Validate values before execution, by the test kind and then its features.
     */
    validateValues() {
        this.validateBaseValues();
        for (const feature of this.features) feature.validate?.(this);
    }

    /**
     * Helper method to evaluate the internal SR5Roll and SuccessTest values.
     */
    async evaluate(): Promise<this> {
        if (!this.hasBuyHits) {
            // Evaluate all rolls.
            for (const roll of this.rolls) {
                if (!roll.evaluated())
                    await roll.evaluate();
            }
        }

        this.data.evaluated = true;
        this.calculateDerivedValues();

        return this;
    }

    /**
     * Allow subclasses to populate a test before execution and any other steps.
     */
    async populateTests() { }

    /**
     * Rehydrate this test with Documents, should they be missing.
     * This can happen when a test is created from a ChatMessage.
     */
    async populateDocuments() {
        // Populate the actor document.
        if (!this.actor && this.data.sourceActorUuid) {
            // SR5Actor.uuid will return an actor id for linked actors but its token id for unlinked actors
            const document = await fromUuid(this.data.sourceActorUuid) || undefined;
            this.actor = document instanceof TokenDocument ?
                (document.actor ?? undefined) :
                (document as SR5Actor);
        }

        // Populate the item document.
        if (this.data.sourceItemUuid) {
            this.item = await fromUuid(this.data.sourceItemUuid) as SR5Item || undefined;
        }

        // Populate the value source document.
        if (this.data.sourceUuid) {
            this.source = await fromUuid(this.data.sourceUuid) as SR5Actor | SR5Item || undefined;
            this.data.sourceIsActor = this.source instanceof SR5Actor;
            if (this.data.sourceIsActor) this.actor = this.source as SR5Actor;
        }

        await this.populateTargetDocuments();
    }

    /**
     * Populate all targets connected to this test.
     */
    async populateTargetDocuments() {
        if (this.targets.length === 0 && this.data.targetUuids) {
            this.targets = [];
            for (const uuid of this.data.targetUuids) {
                const document = await fromUuid<SR5Actor|SR5Item|TokenDocument>(uuid);
                if (!document) continue;

                if (document instanceof SR5Item) {
                    this.targets.push(document);
                    continue;
                }

                // TODO: Why and when are tokens needed? Range calulations? Or was it just the general assumption with Ranged Attack?
                // Can´t we retrieve the token later always?
                if (document instanceof SR5Actor) {
                    const token = document.getToken();
                    if (!(token instanceof TokenDocument)) continue;
                    this.targets.push(token);
                    continue;
                }

                this.targets.push(document);
            }
        }
    }

    /**
     * Prepare missing data based on tests Documents before anything else is done.
     */
    // oxlint-disable-next-line typescript/require-await -- Async hook that subclasses override with awaiting implementations.
    async prepareDocumentData() {
        // Calculate damage here to have access to actor AND item used.
        this.data.damage = ActionFlow.calcDamageData(this.data.damage, this.actor, this.item);
    }

    /**
     * What Action Categories should be used for this test by default.
     * 
     * NOTE: These categories can be overwritten by the source action used to create a test instance.
     * Override this method if you test implementation needs to define different default categories.
     */
    get testCategories(): Shadowrun.ActionCategories[] {
        return [];
    }

    /**
     * Check if this test includes a specific action category.
     * @param category The category name
     * @returns true, when this test includes it. false, if not.
     */
    hasTestCategory(category: Shadowrun.ActionCategories): boolean {
        return this.data.categories.includes(category);
    }

    /**
     * What modifiers should be used for this test type by default.
     *
     * NOTE: These modifiers are routed through ModifierFlow.totalFor()
     */
    get testModifiers(): ModifierTypes[] {
        return ['global', 'wounds'];
    }

    /**
     * Prepare this tests categories.
     * 
     * By default categories are taken from the test implementation but can be overwritten by the source action.
     * 
     * Test categories must be ready before active effects are applied as they rely on this data to be present.
     */
    prepareTestCategories() {
        this.data.categories = 
            this.data.action?.categories.length > 0
            ? this.data.action.categories as Shadowrun.ActionCategories[]
            : this.testCategories;
    }

    /**
     * Prepare modifiers based on connected documents.
     * 
     * Documents MUST've been be populated before hand.
     *
     * Main purpose is to populate the configured modifiers for this test based on actor / items used.
     */
    prepareDocumentModifiers() {
        this.prepareActorModifiers();
        this.prepareItemModifiers();
    }

    /**
     * Allow implementations to overwrite default modifiers after document modifiers have been applied to influence
     * pool calculation.
     */
    prepareTestModifiers() { }

    /**
     * Prepare general modifiers based on the actor, as defined within the action or test implementation.
     */
    prepareActorModifiers() {
        if (!this.actor) return;
        // Don't use default test actions when source action provides modifiers.
        if (this.data.action.modifiers.length > 0) return;

        for (const type of this.testModifiers) {
            const { name, value } = this.prepareActorModifier(this.actor, type);
            ModifiableValue.setUnique(this.data.pool, name, value, { source: "SR5 10" });
        }
    }

    /**
     * Prepare a single modifier.
     * 
     * Extend this method should you want to alter a single modifiers application.
     * 
     * @param actor The actor to fetch modifier information for.
     * @param type The modifier type to be prepared.
     */
    prepareActorModifier(actor: SR5Actor, type: ModifierTypes): { name: string, value: number } {
        const options = { test: this, reapply: true };
        const value = actor.modifiers.totalFor(type, options);
        const name = this._getModifierTypeLabel(type);

        return { name, value };
    }

    _getModifierTypeLabel(type: ModifierTypes): string {
        return SR5.modifierTypes[type] as string;
    }

    /**
     * Allow subclasses to alter test modifiers based on the item used for casting.
     */
    prepareItemModifiers() { }

    /**
     * Calculate the total of all values.
     */
    calculateDerivedValues() {
        // Calculate all derived / static values. Order is important.
        this.data.values.hits = this.calculateHits();
        this.data.values.extendedHits = this.calculateExtendedHits();
        this.data.values.netHits = this.calculateNetHits();
        this.data.values.glitches = this.calculateGlitches();

        console.debug(`Shadowrun 5e | Calculated derived values for ${this.constructor.name}`, this.data);
    }

    /**
     * Helper to get the pool value for this success test.
     */
    get pool(): ValueFieldType {
        return this.data.pool;
    }

    /**
     * Helper to get the total limit value for this success test.
     */
    get limit(): ValueFieldType {
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
     * UI-only render state for the test dialog's limit field.
     * Shows infinity for ignored limits or an explicit no-limit (`0`) without changing roll rules.
     */
    get limitUsage(): { infinity: boolean; disabled: boolean } {
        const applyLimit = game.settings.get(SYSTEM_NAME, FLAGS.ApplyLimits) as boolean;
        return {
            infinity: !this.hasLimit,
            disabled: this.hasPushTheLimit || !applyLimit,
        };
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
    get threshold(): ValueFieldType {
        return this.data.threshold;
    }

    /**
     * UI-only render state for the test dialog's threshold field.
     * Shows a dash for explicit no-threshold (`0`) without changing roll rules.
     */
    get thresholdUsage(): { dash: boolean } {
        return { dash: this.threshold.value <= 0 };
    }

    /**
     * Helper to determine if this success test uses a threshold.
     */
    get hasThreshold(): boolean {
        return this.threshold.value > 0;
    }

    /** Card parameters in reading order; source keys their modifier breakdowns. */
    get cardParameters(): { source: string, value: ValueFieldType }[] {
        const parameters = [{ source: 'pool', value: this.pool }];
        if (this.hasLimit) parameters.push({ source: 'limit', value: this.limit });
        if (this.hasThreshold) parameters.push({ source: 'threshold', value: this.threshold });

        return parameters;
    }

    /**
     * Helper to determine if this success test has a damage value.
     */
    get hasDamage(): boolean {
        // check that we don't have a damage value of 0 and a damage type that isn't empty
        return (this.data.action.damage.value !== 0 || this.data.action.damage.attribute !== "")
                                && this.data.action.damage.type.value !== '';
    }

    /**
     * Helper to get the net hits value for this success test with a possible threshold.
     */
    calculateNetHits(): ValueFieldType {
        // An extended test will use summed up extended hit, while a normal test will use its own hits.
        const hits = this.extended ? this.extendedHits : this.hits;

        // Maybe lower hits by threshold to get the actual net hits.
        const base = this.hasThreshold ?
            Math.max(hits.value - this.threshold.value, 0) :
            hits.value;

        // Calculate a ValueField for standardization.
        const netHits = DataDefaults.createData('value_field', { label: "SR5.NetHits", base });
        ModifiableValue.calcTotal(netHits, { min: 0 });

        return netHits;
    }

    get netHits(): ValueFieldType {
        return this.data.values.netHits;
    }

    /**
     * Helper to get the hits value for this success test with a possible limit.
     */
    calculateHits(): ValueFieldType {
        // Use buy hits, result override or automated roll for hits.
        const rollHits = this.hasBuyHits ? this.boughtHits
            : this.rolls.reduce((hits, roll) => hits + roll.hits, 0);

        // Sum of all rolls!
        this.hits.base = rollHits;

        // First, calculate hits based on roll and modifiers.
        ModifiableValue.calcTotal(this.hits, { min: 0 });
        // Second, reduce hits by limit.
        this.hits.value = this.hasLimit ? Math.min(this.limit.value, this.hits.value) : this.hits.value;

        return this.hits;
    }

    get hits(): ValueFieldType {
        return this.data.values.hits;
    }

    get extendedHits(): ValueFieldType {
        // Return a default value field, for when no extended hits have been derived yet (or ever).
        return this.data.values.extendedHits || DataDefaults.createData('value_field', { label: 'SR5.ExtendedHits' });
    }

    get outcomeHits(): ValueFieldType {
        return this.extended ? this.extendedHits : this.hits;
    }

    /** A subclass may name an extended failure, so check the label itself. */
    get showsFailureOutcome(): boolean {
        return this.failureLabel !== SuccessTest.NO_VERDICT_LABEL;
    }

    get hasBuyHits(): boolean {
        return this.data.buyHits;
    }

    get boughtHits(): number {
        return TestRules.buyHits(this.data.pool.value);
    }

    get hitsBreakdown(): string {
        const modifierHits = this.hits.changes
            .filter(change => !ModifiableValue.isBaseChange(change))
            .reduce((total, change) => total + change.value, 0);

        if (modifierHits === 0) return `${this.hits.value}`;

        const baseHits = this.hits.value - modifierHits;
        return `${baseHits} + ${modifierHits}`;
    }

    // Hide dice pool and roll results as they are not relevant to the success of the test
    get autoSuccess(): boolean {
        return !!this.data.autoSuccess;
    }

    /**
     * Helper to get the glitches values for this success test.
     */
    calculateGlitches(): ValueFieldType {
        // Buy hits produces no glitches.
        const rollGlitches = this.hasBuyHits ? 0
            : this.rolls.reduce((glitches, roll) => glitches + roll.glitches, 0);

        const glitches = DataDefaults.createData('value_field', {
            label: "SR5.Glitches",
            base: rollGlitches
        });
 
        glitches.value = ModifiableValue.calcTotal(glitches, { min: 0 });

        return glitches;
    }

    /**
     * Gather hits across multiple extended test executions.
     */
    calculateExtendedHits(): ValueFieldType {
        if (!this.extended) return DataDefaults.createData('value_field', { label: 'SR5.ExtendedHits' });

        const extendedHits = this.extendedHits;
        ModifiableValue.addBase(extendedHits, 'SR5.Hits', this.hits.value);

        ModifiableValue.calcTotal(extendedHits, { min: 0 });

        return extendedHits;
    }

    /**
     * Check if this test is currently being extended.
     */
    get extended(): boolean {
        if (!this.canBeExtended) return false;
        // The interval is the source of truth, setting it to zero opts out of extending.
        if ((this.data.extendedInterval?.value ?? 0) > 0) return true;
        // Legacy: tests from before extendedInterval existed only carry the extended flag.
        return this.data.extended && this.data.extendedRoll;
    }

    /**
     * Check if this test is on it's first or an extended roll.
     */
    get extendedRoll(): boolean {
        return this.data.extendedRoll;
    }

    /**
     * Can this test type be extended or not?
     *
     * If false, will hide extended dialog settings.
     */
    get canBeExtended(): boolean {
        return true;
    }

    get glitches(): ValueFieldType {
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
        return TestRules.criticalGlitched(this.hits.value, this.glitched);
    }

    /**
     * Check if the current test state is successful.
     * 
     * @returns true on a successful test
     */
    get success(): boolean {
        const decided = this.featureOutcome('success');
        if (decided !== undefined) return decided;

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
        const decided = this.featureOutcome('canSucceed');
        if (decided !== undefined) return decided;

        // Not extended tests can succeed normally.
        if (!this.extended) return true;

        // Extended tests can only succeed when a threshold is set.
        return this.extended && this.hasThreshold;
    }

    /**
     * Use this method for subclasses which can't reasonably fail.
     */
    get canFail(): boolean {
        const decided = this.featureOutcome('canFail');
        if (decided !== undefined) return decided;

        return true;
    }

    /**
     * While a test might be successful with a zero threshold, it's
     * unclear if it's meant to be a success.
     * 
     * Tests that don't know their threshold, either by GM secrecy or
     * following opposed tests not yet thrown, shouldn't show user
     * their successful.
     */
    get showSuccessLabel(): boolean {
        return this.success && this.hasThreshold;
    }

    /**
     * How to call a successful test of this type.
     */
    get successLabel(): Translation {
        return 'SR5.TestResults.Success';
    }

    /**
     * How to call a failed test of this type.
     */
    get failureLabel(): Translation {
        if (this.extended) return SuccessTest.NO_VERDICT_LABEL;
        return 'SR5.TestResults.Failure';
    }

    /** Ordinary rolls still show hits without a verdict. */
    get showsOutcome(): boolean {
        return (this.canSucceed && this.showSuccessLabel)
            || (this.canFail && this.failure)
            || this.glitched || !this.autoSuccess;
    }

    get outcomeLabel(): Translation | undefined {
        if (this.criticalGlitched) return 'SR5.GlitchCritical';
        if (this.canSucceed && this.showSuccessLabel) return this.successLabel;
        if (this.canFail && this.failure && this.showsFailureOutcome) return this.failureLabel;
        return undefined;
    }

    /**
     * Helper to check if opposing tests exist for this test.
     */
    get opposed(): boolean {
        return !!this.data.opposed && this.data.opposed.test !== undefined && this.data.opposed.test !== '';
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
    get results(): ActionResultType | undefined {
        return this.item?.getActionResult();
    }

    /**
     * Determine if this test has any targets selected using FoundryVTT targeting.
     */
    get hasTargets(): boolean {
        return this.targets.length > 0;
    }

    get targetRangeOptions(): { value: number, label: string }[] {
        const data = this.data as T & {
            targetRanges?: Array<{ name: string, distance: number, unit: string }>
        };

        if (!Array.isArray(data.targetRanges)) return [];

        return data.targetRanges.map((target, index) => ({
            value: index,
            label: `${target.name} (${target.distance} ${target.unit})`
        }));
    }

    get rangeOptions(): { value: number, label: string }[] {
        const data = this.data as T & {
            ranges?: Record<string, { modifier: number, label: string, distance: number }>
        };

        if (!data.ranges) return [];

        return Object.values(data.ranges).map(range => ({
            value: Number(range.modifier),
            label: `${game.i18n.localize(range.label)} (${range.distance} m)`
        }));
    }

    /**
     * Has this test been derived from an action?
     *
     * This can either be from an items action or a pre-configured action.
     */
    get hasAction(): boolean {
        return !foundry.utils.isEmpty(this.data.action);
    }

    get hasPushTheLimit(): boolean {
        return this.data.pushTheLimit;
    }

    get hasSecondChance(): boolean {
        return this.data.secondChance;
    }

    /**
     * Determine if this test can use second chance rules.
     * 
     * Use this property to check if a existing test can use this edge rule.
     * 
     * SR5#56.
     */
    get canSecondChance(): boolean {
        if (this.features.some(feature => feature.edge?.secondChance === false)) {
            ui.notifications?.warn('SR5.Warnings.CantUseEdgeOnThisTest', { localize: true });
            return false;
        }

        if (this.hasBuyHits) {
            ui.notifications?.warn('SR5.Warnings.CantCombineBuyHitsWithEdge', { localize: true });
            return false;
        }

        if (!this.evaluated) {
            console.error('Shadowrun5e | Second chance edge rules should not be applicable on initial cast');
            return false;
        }
        // According to rules, second chance can't be used on glitched tests.
        if (this.glitched) {
            ui.notifications?.warn('SR5.Warnings.CantSecondChanceAGlitch', { localize: true });
            return false;
        }

        if (this.hasPushTheLimit || this.hasSecondChance) {
            ui.notifications?.warn('SR5.Warnings.CantSpendMulitplePointsOfEdge', { localize: true });
            return false;
        }

        return true;
    }

    /**
     * Determine if this test can use push the limit rules
     * 
     * Use this property to check if a existing test can use this edge rule.
     * 
     * SR5#56.
     */
    get canPushTheLimit(): boolean {
        if (this.features.some(feature => feature.edge?.pushTheLimit === false)) {
            ui.notifications?.warn('SR5.Warnings.CantUseEdgeOnThisTest', { localize: true });
            return false;
        }

        if (this.hasPushTheLimit || this.hasSecondChance) {
            ui.notifications?.warn('SR5.Warnings.CantSpendMulitplePointsOfEdge', { localize: true });
            return false;
        }

        return true;
    }

    /**
     * Handle Edge rule 'push the limit', either adding edge before or after casting
     * and exploding sixes for either all dice or only edge dice.
     * 
     * Check edge rules on SR5#56.
     * 
     * If called without push the limit, all modifiers for it will be removed.
     */
    applyPushTheLimit() {
        if (!this.actor) return;

        const parts = new ModifiableValue(this.pool);

        // During the lifetime of a test (dialog/recasting) the user might want to remove push the limit again.
        if (!this.hasPushTheLimit) {
            parts.remove('SR5.PushTheLimit');
            return;
        }

        // Edge will be applied differently for when the test has been already been cast or not.
        // Exploding dice will be handled during normal roll creation.
        const edge = this.actor.getEdge().value;
        parts.addUnique('SR5.PushTheLimit', edge);

        // Before casting edge will be part of the whole dice pool and that pool will explode.
        if (!this.evaluated) return;

        // After casting use a separate roll, as only those will be rolled again and explode.
        const explodeDice = true;
        const formula = this.buildFormula(edge, explodeDice);
        const roll = new SR5Roll(formula);
        this.rolls.push(roll);
    }

    /**
     * Handle Edge rules for 'second chance'.
     * 
     * If called without second chance, all modifiers for it will be removed.
     */
    applySecondChance() {
        if (!this.actor) return;

        const parts = new ModifiableValue(this.pool);

        if (this.hasBuyHits) {
            this.data.secondChance = false;
            parts.remove('SR5.SecondChance');
            return;
        }

        // During test lifetime (dialog/recasting) the user might want to remove second chance again.
        if (!this.hasSecondChance) {
            parts.remove('SR5.SecondChance');
            return;
        }

        // Since only ONE edge can be spent on a test, last roll will either be a
        // - the original dice pool
        // - an extending dice pool
        const lastRoll = this.rolls[this.rolls.length - 1];
        const dice = lastRoll.poolThrown - lastRoll.hits;
        if (dice <= 0) {
            ui.notifications?.warn('SR5.Warnings.CantSecondChanceWithoutNoneHits', { localize: true });
            return this;
        }

        // Apply second chance modifiers.
        // Overwrite existing, as only ONE edge per test is allowed, therefore stacking is not possible.
        parts.addUniqueBase('SR5.SecondChance', dice);

        // Add new dice as fully separate Roll.
        const formula = `${dice}ds`;
        const roll = new SR5Roll(formula);
        this.rolls.push(roll);
    }

    /**
     * Make sure ALL resources needed are available.
     * 
     * This is checked before any resources are consumed.
     * 
     * @returns true when enough resources are available to consume
     */
    canConsumeDocumentResources(): boolean {
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
     * @return true when the resources could be consumed in appropriate amounts.
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
    * Consume resources according to whats configured for this world.
    * @returns true when the test can process
    */
    async consumeDocumentRessoucesWhenNeeded(): Promise<boolean> {
        const mustHaveRessouces = game.settings.get(SYSTEM_NAME, FLAGS.MustHaveRessourcesOnTest);
        // Make sure to nest canConsume to avoid unnecessary warnings.
        if (mustHaveRessouces) {
            if (!this.canConsumeDocumentResources()) return false;
        }

        if (!await this.consumeDocumentRessources()) return false;
        return this.runFeatureConsume();
    }

    /**
     * Allow users to execute this test, even when they don't have permissions to execute the source document.
     * 
     * This should be used per test instance to ignore user permissions between test instanciation and execution.
     */
    allowUserExecute() {
        this.ignoreUserPermission = true;
    }
    
    /**
     * Can a user execute this test? This is used to check if the user has permissions to execute this test at all, before any preparation is done.
     * 
     * By default 'OBSERVER' is used as that allows users to see document ratings.
     * 
     * @returns true if the current user is allowed to execute this test, otherwise false.
     */
    userCanExecute() {
        if (this.ignoreUserPermission) return true;
        if (!this.source) return true;
        if (!this.source.testUserPermission(game.user, 'OBSERVER')) return false;

        return true;
    }

    /**
     * Prepare everything needed for test execution.
     * 
     * This is both necessary before a first execution or when re-calculation a test when execution has already
     * been prepared.
     */
    async _prepareExecution() {
        await this.populateTests();
        await this.populateDocuments();

        this.prepareTestCategories();

        // Effects need to be applied before any values are calculated.
        this.effects.applyAllEffects();

        await this.prepareDocumentData();
        await this.runFeatureStage('prepareDocuments');

        // Initial base value preparation will show default result without any user input.
        this.prepareBaseValues();
        this.calculateBaseValues();
        this.validateValues();
    }

    /**
     * The features this test uses: those of its kind, changed by the features given in its data.
     */
    get features(): TestFeature[] {
        return TestFeatureRules.resolve(TestFeatureRules.resolveIds(this.constructor.features, this.data.features));
    }

    /**
     * Run an asynchronous stage of all features of this test, in order.
     */
    async runFeatureStage(stage: 'prepareDocuments' | 'process') {
        for (const feature of this.features) {
            const handler = feature[stage];
            if (!handler) continue;
            this.featureTrace.push({ stage, feature: feature.id });
            await handler.call(feature, this);
        }
    }

    /**
     * Let all features add their value parts.
     */
    runFeatureValues() {
        for (const feature of this.features) {
            if (!feature.prepareValues) continue;
            this.featureTrace.push({ stage: 'prepareValues', feature: feature.id });
            feature.prepareValues(this);
        }
    }

    /**
     * Let all features consume their resources. Stops at the first feature that can't.
     *
     * @returns true when all features could consume.
     */
    async runFeatureConsume(): Promise<boolean> {
        for (const feature of this.features) {
            if (!feature.consume) continue;
            this.featureTrace.push({ stage: 'consume', feature: feature.id });
            if (!await feature.consume(this)) return false;
        }
        return true;
    }

    /**
     * The outcome value decided by the last feature deciding it, if any.
     */
    featureOutcome(key: keyof TestFeatureOutcome): boolean | undefined {
        let decided: boolean | undefined;
        for (const feature of this.features) {
            const value = feature.outcome?.(this)[key];
            if (value !== undefined) decided = value;
        }
        return decided;
    }

    /**
     * Executing a test will start all behaviors necessary to:
     * - Calculate its values
     * - Show and handle a user facing test dialog
     * - Render and show a resulting test message
     * - Evaluate all it's roles and consumption of items used
     * - Trigger resulting methods for all results, including success and failure
     *
     * Implementing classes should seek to change out methods used here, or within those methods, to alter test
     * behavior to their needs.
     *
     * When execute methods promise resolves this test and its chain is completed.
     *
     * Each stage of the execution fires the sr5_testStage hook, see run().
     */
    async execute(): Promise<this> {
        return this.run(TestModes.normal);
    }

    /**
     * Handle Edge rule 'second chance' within this test according to SR5#56
     * 
     * This is a execute method alternative.
     */
    async executeWithSecondChance(): Promise<this> {
        console.debug(`Shadowrun 5e | ${this.constructor.name} will apply second chance rules`);
        return this.run(TestModes.secondChance);
    }

    /**
     * A execute method alternative to handle Edge rule 'push the limit' within this test.
     */
    async executeWithPushTheLimit(): Promise<this> {
        console.debug(`Shadowrun 5e | ${this.constructor.name} will push the limit rules`);
        return this.run(TestModes.pushTheLimit);
    }

    /**
     * Execute this test through all pipeline stages, as the given mode configures them.
     *
     * Each stage fires the sr5_testStage hook with its name once done. A stage stopping the
     * execution, like a canceled dialog, stops all stages after it.
     */
    async run(mode: TestMode): Promise<this> {
        if (mode.allowed && !mode.allowed(this)) return this;

        await mode.prepare(this);
        this.pipelineStage('prepare');

        if (!this.userCanExecute()) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.CantExecuteTest'));
            return this;
        }
        if (mode.requiresActor && !this.actor) {
            ui.notifications?.warn('SR5.Warnings.EdgeRulesCantBeAppliedOnTestsWithoutAnActor', { localize: true });
            return this;
        }
        this.pipelineStage('check');

        mode.beforeDialog?.(this);
        // Allow user to change details.
        if (mode.dialog && !await this.showDialog()) return this;
        this.pipelineStage('dialog');

        // Check if actor has all needed resources to even test.
        if (!await this.consumeDocumentRessoucesWhenNeeded()) return this;
        mode.afterConsume?.(this);
        this.pipelineStage('consume');

        if (mode.createRoll) this.createRoll();
        await this.evaluate();
        this.pipelineStage('roll');

        await this.processResults();
        mode.afterProcess?.(this);
        this.pipelineStage('process');

        await this.toMessage();
        this.pipelineStage('message');

        await this.afterTestComplete();
        this.pipelineStage('complete');

        return this;
    }

    /**
     * Announce a finished pipeline stage of this test.
     */
    pipelineStage(stage: TestPipelineStage) {
        Hooks.call('sr5_testStage', this, stage);
    }

    /**
     * Allow subclasses to override behavior after a test has finished.
     *
     * This can be used to alter values after a test is over.
     */
    async processResults() {
        if (this.success) {
            await this.processSuccess();
        } else {
            await this.processFailure();
        }

        await this.runFeatureStage('process');

        Hooks.call('sr5_testProcessResults', this);
    }

    /**
     * Allow subclasses to override behavior after a successful test result.
     *
     * This can be used to alter values after a test succeeded.
     * @override
     */
    async processSuccess() { }

    /**
     * Allow subclasses to override behavior after a failure test result
     *
     * This can be used to alter values after a test failed.
     * @override
     */
    async processFailure() { }

    /**
     * Allow subclasses to override behavior after a test is fully done. This will be called after processResults
     * and allows for additional processes to be triggered that don't affect this test itself.
     *
     * This can be used to trigger other processes like followup tests or saving values.
     */
    async afterTestComplete() {
        console.debug(`Shadowrun5e | Test ${this.constructor.name} completed.`, this);

        // Record before any followup runs, as those look up this tests flow state.
        const flowState = await FlowRunner.recordTest(this);

        if (this.success) {
            await this.afterSuccess();
        } else {
            await this.afterFailure();
        }

        // Tests outside any flow still apply their effects and execute their configured follow up test.
        if (flowState) {
            await FlowRunner.runNext(this, flowState);
        } else {
            await this.applyTargetedEffectsOutsideFlow();
            if (this.autoExecuteFollowupTest) await this.executeFollowUpTest();
        }

        // Managed tests are continued by their record. Preserve auto-chaining for in-progress
        // tests restored from pre-manager chat messages, which have no managed record to update.
        if (this.extended && this.extendedRoll && !this.data.extendedManagedId) {
            await this.executeAsExtended();
        }

        Hooks.call('sr5_afterTestComplete', this);
    }

    /**
     * Allow subclasses to override followup behavior after a successful test result
     * @override
     */
    async afterSuccess() { }

    /**
     * Apply targeted actor effects for tests outside any flow.
     *
     * Unopposed tests apply them to their targets on success, opposing tests to their own actor on failure.
     */
    async applyTargetedEffectsOutsideFlow() {
        if (this.opposing) {
            if (this.success || !this.actor) return;
            await this.effects.createTargetActorEffects(this.actor);
            return;
        }

        if (!this.success || this.opposed) return;
        for (const target of this.targets as TokenDocument[]) {
            if (target.actor === null) continue;
            await this.effects.createTargetActorEffects(target.actor);
        }
    }

    /**
     * Allow subclasses to override followup behavior after a failed test result
     * @override
     */
    async afterFailure() { }

    /**
     * Allow a test to determine if it's follow up tests should auto cast after test completion.
     * 
     * This could be set to false to allow for tests to NOT have an immediate auto cast, due to 
     * current user casting and the user casting the follow differing.
     */
    get autoExecuteFollowupTest() {
        return true;
    }

    /**
     * Allow a test to veto a flow step directly following it, based on its own results.
     *
     * @param step The step that would follow this test.
     */
    flowAllowsStep(step: FlowStep): boolean {
        return true;
    }

    /**
     * Depending on the action configuration execute a followup test.
     *
     * @param testClsName The follow up test to use instead of the one configured on the action.
     * @param features Feature changes for the follow up test. See TestFeature.
     */
    async executeFollowUpTest(testClsName?: string, features: string[] = []) {
        const test = await TestCreator.fromFollowupTest(this, this.data.options, testClsName);
        if (!test) return;
        if (features.length) test.data.features = [...(test.data.features ?? []), ...features];
        await test.execute();
    }

    /**
     * Should this test be an extended test, re-execute it until it can't be anymore.
     * 
     * The first roll of extended test will use normal #execute, while the extended rolls
     * will pass through this, both for the action and chat message extension flow.
     */
    async executeAsExtended() {
        if (!this.canBeExtended) return;

        const data = foundry.utils.deepClone(this.data);

        // No extension possible, if test type / class is unknown.
        if (!data.type) return;

        // Apply the extended modifier according the current iteration
        const pool = new ModifiableValue(data.pool);

        const currentModifierValue = pool.get('SR5.ExtendedTest') || 0;
        const nextModifierValue = TestRules.calcNextExtendedModifier(currentModifierValue);

        // A situational modifier, not part of the pool itself, so it stays among the changes.
        pool.setUnique('SR5.ExtendedTest', nextModifierValue);

        ModifiableValue.calcTotal(data.pool, { min: 0 });

        if (!TestRules.canExtendTest(this.threshold.value, this.extendedHits.value)) {
            ui.notifications?.warn('SR5.Warnings.CantExtendTestFurther', { localize: true });
            return this;
        }

        // Fetch original tests documents.
        await this.populateDocuments();

        if (!this.userCanExecute()) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.CantExecuteTest'));
            return this;
        }

        // Create a new test instance of the same type.
        const testCls = TestCreator._getTestClass(data.type);
        if (!testCls) return;
        // The new test will be incomplete.
        data.evaluated = false;
        const test = new testCls(data as DeepPartial<T>, { actor: this.actor, item: this.item }, this.data.options);

        // Remove previous edge usage.
        test.data.pushTheLimit = false;
        test.applyPushTheLimit();
        test.data.secondChance = false;
        test.applySecondChance();

        // Mark test as extended to get iterative execution.
        if (!test.extended) {
            test.data.extended = true;
            test.data.values.extendedHits = test.calculateExtendedHits();
        }

        // Mark this roll as an extended roll.
        // This allows execution to determine if data needs to be prepared for the first roll or not.
        test.data.extendedRoll = true;

        await test.execute();

        return test;
    }

    /**
     * Show the dice of this tests last roll with Dice So Nice. See TestChatFlow.rollDiceSoNice.
     */
    rollDiceSoNice() {
        TestChatFlow.rollDiceSoNice(this);
    }

    /**
     * Post this success test as a message to the chat log.
     */
    async toMessage(): Promise<ChatMessage | undefined> {
        return TestChatFlow.toMessage(this);
    }

    /**
     * Prepare chat message content data for this success test card.
     *
     * @returns Chat Message template data.
     *
     * TODO: Add template data typing.
     */
    async _prepareMessageTemplateData() {
        // Either get the linked token by collection or synthetic actor.
        // Unlinked collection actors will return multiple tokens and can't be resolved to a token.
        const linkedTokens = this.actor?.getActiveTokens(true) || [];
        const token = linkedTokens.length >= 1 ? linkedTokens[0] : undefined;

        const description = await this.item?.getChatData() || '';

        return {
            title: this.data.title,
            test: this,
            // Note: While ChatData uses ids, this uses full documents.
            speaker: {
                token,
                source: this.source,
                // TODO: Check if speaker.actor is needed still or if speaker.source suffices
                actor: this.actor
            },
            item: this.item,
            opposedActions: this._prepareOpposedActionsTemplateData(),
            followupActions: this._prepareFollowupActionsTemplateData(),
            resistActions: this._prepareResistActionsTemplateData(),
            resultActions: this._prepareResultActionsTemplateData(),
            // Without content the toggle would open an empty panel, so drop the control with it.
            showDescription: this._canShowDescription && this._hasDescriptionContent(description),
            description,
            // Some message segments are only meant for the gm, when the gm is the one creating the message.
            // When this test doesn't use an actor, don't worry about hiding anything.
            applyGmOnlyContent: GmOnlyMessageContentFlow.applyGmOnlyContent(this.actor),
            
            // Effects that should be shown in this tests message for manual drag & drop application.
            effects: [] as SR5ActiveEffect[],

            // Message parts of the features this test uses.
            featurePartials: this.features.flatMap(feature => feature.chat ? [feature.chat.partial] : []),
        }
    }

    /**
     * Indicate if this test can be used to show the item description.
     */
    get _canShowDescription(): boolean {
        return true;
    }

    _hasDescriptionContent(description: unknown): boolean {
        if (!description || typeof description !== 'object') return false;

        const { description: text, properties } = description as {
            description?: { value?: string },
            properties?: unknown[]
        };

        return Boolean(text?.value?.trim()) || Boolean(properties?.length);
    }

    /**
     * This class should be used for the opposing test implementation.
     */
    get _opposedTestClass() {
        if (!this.data?.opposed?.test) return;
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

        return [action]
    }

    /**
     * Prepare followup actions a test allows. These are actions
     * meant to be taken following completion of this test.
     */
    _prepareFollowupActionsTemplateData() {
        const testCls = TestCreator._getTestClass(this.data.action.followed.test);
        if (!testCls) return [];
        return [{ label: testCls.label }]
    }

    get _resistTestClass(): any {
        return undefined; // by default we don't want to show any resist test in a success test
    }

    /**
     * Prepare Resist actions a test allows. These are actions
     * meant to be taken following completion of an opposed test
     * or as a way to resist direct damage of a test
     */
    _prepareResistActionsTemplateData() {
        const testCls = this._resistTestClass;
        // No resist test configured. Nothing to build.
        if (!testCls) return [];

        const action = {
            // Store the test implementation registration name.
            test: testCls.name,
            label: testCls.label
        };

        return [action]
    }

    /**
     * Prepare result action buttons
     */
    _prepareResultActionsTemplateData(): ResultActionType[] {
        const actions: ResultActionType[] = [];

        // Interrupt/Varies actions carry an initiative modifier that can be applied to the combatant.
        const actionType = this.data.action?.type;
        const initiativeMod = this.data.action?.initiative_mod;
        if (initiativeMod && (actionType === 'interrupt' || actionType === 'varies')) {
            actions.push({
                action: 'modifyCombatantInit',
                label: 'SR5.InitiativeMod',
                value: String(initiativeMod)
            });
        }

        const actionResultData = this.results;
        if (!actionResultData) return actions;

        return actions;
    }

    /**
     * What ChatMessage rollMode is this test supposed to use?
     */
    get _rollMode(): ChatMessage.Mode {
        return this.data.options?.rollMode ?? game.settings.get(CORE_NAME, 'messageMode') as ChatMessage.Mode;
    }

    /**
     * Prepare chat message data for this success test card.
     *
     * @param content Pre rendered template content.
     */
    async _prepareMessageData(content: string) {
        return TestChatFlow.prepareMessageData(this, content);
    }

    /**
     * Save this test to the given message uuid
     */
    async saveToMessage(uuid: string | undefined = this.data.messageUuid) {
        await TestChatFlow.saveToMessage(this, uuid);
    }

    /**
     * Register listeners for ChatMessage html created by a SuccessTest.
     *
     * This listener needs to be registered to the 'renderChatMessage' FoundryVTT hook.
     */
    static async chatMessageListeners(message: ChatMessage, html) {
        await TestChatFlow.chatMessageListeners(message, html);
    }

    static async hydrateValueModifierTooltipsForTest(test: SuccessTest, html: HTMLElement | JQuery, options: ValueModifierTooltipOptions = {}) {
        await TestChatFlow.hydrateValueModifierTooltipsForTest(test, html, options);
    }

    /**
     * Foundry ChatMessage context options (right click) used for all test types.
     */
    static chatMessageContextOptions(app, options: ChatMessageContextOption[]) {
        return TestChatFlow.chatMessageContextOptions(app, options);
    }

    static _chatToggleParameterDetails(event: Event | JQuery.ClickEvent) {
        TestChatFlow._chatToggleParameterDetails(event);
    }

    /**
     * Execute actions triggered by a tests chat message.
     * 
     * This can be used to trigger opposing tests.
     */
    static async executeMessageAction(againstData: SuccessTestData, messageId: string, options: Partial<TestOptions>) {
        const documents = await this.messageActionSubjects(againstData);

        // Inform user about tokens with deleted sidebar actors.
        // This can both happen for linked tokens immediately and unlinked tokens after reloading.
        // TODO: Check when this error is relevant.
        if (documents.filter(document => !document).length > 0) {
            ui.notifications?.warn('TOKEN.WarningNoActor', {localize: true});
            return;
        }

        if (documents.length === 0) {
            // Tests rolled by the caster for an opposition without actor have nobody else to fall back to.
            if (this.subjects === 'caster') {
                ui.notifications?.error('SR5.Errors.NoAvailableActorFound', { localize: true });
                return;
            }
            // Fallback to player character.
            if (game.user?.character) documents.push(game.user.character);
        }

        console.log('Shadowrun 5e | Casting an opposed test using these actors', documents, againstData);

        for (const document of documents as FlowSubjectDocument[]) {
            const source = document instanceof TokenDocument ? document.actor! : document;

            const data = await this._getOpposedActionTestData(againstData, source, messageId);
            if (!data) return;

            const test = new this(data, { source }, options);

            // Await test chain resolution for each actor, to avoid dialog spam.
            await test.execute();
        }
    }

    /**
     * Who rolls this test when cast from the message of the test it follows. See FlowSubjects.
     */
    static subjects = 'targets';

    /**
     * The documents to roll this test with, when cast from the message of the test it follows.
     */
    static async messageActionSubjects(againstData: SuccessTestData) {
        const resolver = FlowSubjects[this.subjects] ?? FlowSubjects.targets;
        return resolver(againstData);
    }

    /**
     * Add an additional test target after test initialization
     * 
     * @param document Any targetable FoundryVTT document
     */
    async addTarget(document: SR5Actor|SR5Item) {
        if (!document.uuid) return;
        if (this.data.targetUuids.includes(document.uuid)) return;
        this.data.targetUuids.push(document.uuid);
        await this.populateTargetDocuments();
    }
}
