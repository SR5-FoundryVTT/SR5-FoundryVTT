import { SuccessTest, SuccessTestData, SuccessTestValues, TestData, TestDocuments, TestOptions } from "./SuccessTest";
import { DataDefaults } from "../data/DataDefaults";
import { TestCreator } from "./TestCreator";
import { SR5Item } from "../item/SR5Item";
import { PartsList } from "../parts/PartsList";
import { Helpers } from "../helpers";
import { ValueFieldType } from "../types/template/Base";
import { SR5Actor } from "../actor/SR5Actor";


export interface OpposedTestValues extends SuccessTestValues {
    // The calculated overall netHits of the active vs opposed test pair.
    againstNetHits: ValueFieldType;
}

export interface OpposedTestData extends
    TestData,
    // Remove unnecessary data points.
    Omit<SuccessTestData, 'opposed'>,
    Omit<SuccessTestData, 'targetTokensUuid'> {

    // The message id of the opposed test.
    previousMessageId: string
    values: OpposedTestValues
    against: SuccessTestData
}
/**
 * An opposed test results from a normal success test as an opposed action.
 */
export class OpposedTest<T extends OpposedTestData = OpposedTestData> extends SuccessTest<T> {
    public against: SuccessTest;

    constructor(data, documents?: TestDocuments, options?: TestOptions) {
        super(data, documents, options);

        // Use the supplied original active test to create a reference.
        // If nothing was given create a default placeholder
        // Feed original / active test data into the class originally used for ease of access.
        const AgainstCls = data.against ? TestCreator._getTestClass(data.against.type) : SuccessTest;
        this.against = new AgainstCls(data.against || {});
    }

    override _prepareData(data, options?): any {
        data = super._prepareData(data, options);

        // TODO: this isn't needed if opposed is always taken from data.action.opposed
        delete data.opposed;
        delete data.targetActorsUuid;

        data.values = data.values || {};
        data.values.againstNetHits = DataDefaults.createData('value_field', {label: 'SR5.NetHits'});

        return data;
    }

    /**
     * Before populating any documents for THIS test, populate the opposed tests documents first.
     */
    override async populateTests() {
        await this.against.populateDocuments();
    }

    override calculateDerivedValues() {
        super.calculateDerivedValues();

        // Reflect overall netHits of active vs opposed test.
        this.data.values.againstNetHits = this.calculateAgainstNetHits();
    }

    /**
     * To have proper net hits values for the original test, we calculate it's netHits values after the opposed test
     * is finished.
     * 
     * We don't change the original netHits to not interfere with the original test and allow it to still 
     * report correct netHits against it's own (possible) threshold.
     */
    calculateAgainstNetHits() {
        const base = Math.max(this.against.hits.value - this.hits.value, 0);
        const againstNetHits = DataDefaults.createData('value_field', {label: 'SR5.NetHits', base});
        againstNetHits.value = Helpers.calcTotal(againstNetHits, {min: 0});
        return againstNetHits;
    }

    /**
     * Prepare any OpposedTest from given test data. This test data should origin from a original success test, that is to be opposed.
     * 
     * Typically this would be as part of a test => message => oppose flow
     * 
     * @param againstData The original test to be opposed in raw data.
     * @param document The actor used to oppose this original test with.
     * @param previousMessageId The chat message the original test is stored within.
     * @returns TestData for the opposed test.
     */
    static override async _getOpposedActionTestData(
        againstData: SuccessTestData,
        document: SR5Actor|SR5Item,
        previousMessageId: string
    ): Promise<OpposedTestData | undefined> {
        if (!againstData.opposed) {
            console.error(`Shadowrun 5e | Supplied test data doesn't contain an opposed action`, againstData, this);
            return;
        }
        if (againstData.opposed.type !== '') {
            console.warn(`Shadowrun 5e | Supplied test defines a opposed test type ${againstData.opposed.type} but only type '' is supported`, this);
        }
        if (!document) {
            console.error(`Shadowrun 5e | Can't resolve opposed test values due to missing actor`, this);
            return;
        }

        // Prepare testing data.
        const data: SuccessTestData = {
            // While not visible, when there is a description set, use it.
            title: againstData.opposed.description || undefined,

            previousMessageId,

            pool: DataDefaults.createData('value_field', {label: 'SR5.DicePool'}),
            limit: DataDefaults.createData('value_field', {label: 'SR5.Limit'}),
            threshold: DataDefaults.createData('value_field', {label: 'SR5.Threshold'}),
            //@ts-expect-error SuccessTest.prepareData is adding missing values, however these aren't actually optional.
            values: {},

            modifiers: DataDefaults.createData('value_field', {label: 'SR5.Labels.Action.Modifiers'}),

            sourceItemUuid: againstData.sourceItemUuid,
            against: againstData
        }

        // An opposing test will oppose net hits of the original / success test.
        // Register these as a threshold, which will trigger success/failure status
        // and calculate netHits accordingly.
        data.threshold.base = againstData.values.netHits.value;

        // The original action doesn't contain a complete set of ActionData.
        // Therefore we must create an empty dummy action.
        let action = DataDefaults.createData('action_roll');

        // Allow the OpposedTest to overwrite action data using its class default action.
        action = TestCreator._mergeMinimalActionDataInOrder(action,
            // Use action data from the original action at first.
            againstData.opposed,
            // Overwrite with the OpposedTest class default action, if any.
            this._getDefaultTestAction()
        );

        // Allow the OpposedTest to overwrite action data dynamically based on item data.
        if (againstData.sourceItemUuid) {
            const item = await fromUuid(againstData.sourceItemUuid) as SR5Item;
            if (item) {
                const itemAction = this._getDocumentTestAction(item, document);
                action = TestCreator._mergeMinimalActionDataInOrder(action, itemAction);
            }
        }

        return this._prepareActionTestData(action, document, data, againstData) as OpposedTestData;
    }

    /**
     * Overwrite SuccessTest#opposed behavior as an OpposedTest can't have another opposed test.
     */
    override get opposed() {
        return false;
    }

    /**
     * Overwrite SuccessTest#opposing behavior as an OpposedTest is opposing another test.
     */
    override get opposing() {
        return true;
    }

    /**
     * This test type can't be extended.
     */
    override get canBeExtended() {
        return false;
    }

    /**
     * Opposed tests shouldn't show item description from the active tests source item.
     */
    override get _canShowDescription(): boolean {
        return false;
    }

    /**
     * Opposed tests can't cause any blast template.
     */
    override get _canPlaceBlastTemplate(): boolean {
        return false;
    }

    /**
     * Derived net hits of the active vs opposed test pair.
     */
    get againstNetHits(): ValueFieldType {
        return this.data.values.againstNetHits;
    }

    /**
     * Apply opposed test modifiers based on the item implementation
     */
    override prepareItemModifiers() {
        if (!this.item) return;

        // NOTE: This is a legacy method for applying item data based modifiers, but it will do.
        const opposedMod = this.item.getOpposedTestMod();

        // Do not simply concat list to avoid double applying an otherwise unique test modifier.
        for (const modifier of opposedMod.list) {
            PartsList.AddUniquePart(this.data.modifiers.mod, modifier.name, modifier.value, true);
        }
    }

    /**
     * Using a message action cast an opposed test to that messages active test.
     *
     * @param event A PointerEvent by user interaction to trigger the test action.
     */
    static async _castOpposedAction(event) {
        event.preventDefault();

        const button = $(event.currentTarget);
        const card = button.closest('.chat-message');

        // Collect information needed to create the opposed action test.
        const messageId = card.data('messageId');
        const opposedActionTest = button.data('action');

        const showDialog = !TestCreator.shouldHideDialog(event);
        await TestCreator.fromMessageAction(messageId, opposedActionTest, {showDialog});
    }

    static override async chatMessageListeners(message: ChatMessage, html, data) {
        // TODO: querySelectorAll ?
        $(html).find('.opposed-action').on('click', OpposedTest._castOpposedAction.bind(this));
    }

    /**
     * Inject effects taken from the active original test and inject them into the opposed chat message.
     */
    override async _prepareMessageTemplateData() {
        const templateData = await super._prepareMessageTemplateData();

        if (!this.against) return templateData;

        for (const effect of this.against.effects.allApplicableEffectsToTargetActor()) {
            templateData.effects.push(effect);
        }

        return templateData;
    }

    override async afterFailure() {
        await super.afterFailure();

        // When an opposed test fails, the original test documents targeted actor effects can be applied
        const against = this.against;
        const actor = this.actor;
        if (against === undefined && !this.opposing) return;
        if (actor === undefined) return;

        await this.effects.createTargetActorEffects(actor);
    }
}