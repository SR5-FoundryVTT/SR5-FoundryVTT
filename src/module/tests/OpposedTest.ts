import {SuccessTest, SuccessTestData, SuccessTestValues, TestData, TestDocuments, TestOptions} from "./SuccessTest";
import {DefaultValues} from "../data/DataDefaults";
import {TestCreator} from "./TestCreator";
import {SR5Item} from "../item/SR5Item";
import {PartsList} from "../parts/PartsList";


export interface OpposedTestValues extends SuccessTestValues {
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
export class OpposedTest extends SuccessTest {
    public data: OpposedTestData;
    public against: SuccessTest;

    constructor(data, documents?: TestDocuments, options?: TestOptions) {
        super(data, documents, options);

        // Use the supplied original active test to create a reference.
        // If nothing was given create a default placeholder
        // @ts-ignore // Feed original / active test data into the class originally used for ease of access.
        const AgainstCls = data.against ? TestCreator._getTestClass(data.against.type) : SuccessTest;
        this.against = new AgainstCls(data.against || {});
    }

    _prepareData(data, options?): any {
        data = super._prepareData(data, options);

        // TODO: this isn't needed if opposed is always taken from data.action.opposed
        delete data.opposed;
        delete data.targetActorsUuid;

        return data;
    }

    async populateDocuments() {
        await super.populateDocuments();
        await this.against.populateDocuments();
    }

    static async _getOpposedActionTestData(againstData: SuccessTestData, actor, previousMessageId: string): Promise<OpposedTestData | undefined> {
        if (!againstData.opposed) {
            console.error(`Shadowrun 5e | Supplied test data doesn't contain an opposed action`, againstData, this);
            return;
        }
        // @ts-ignore // TODO: Typing expects a boolean, though OpposedTestData defines it as string. Odd.
        if (againstData.opposed.type !== '') {
            console.warn(`Shadowrun 5e | Supplied test defines a opposed test type ${againstData.opposed.type} but only type '' is supported`, this);
        }
        if (!actor) {
            console.error(`Shadowrun 5e | Can't resolve opposed test values due to missing actor`, this);
            return;
        }

        // Prepare testing data.
        const data = {
            // While not visible, when there is a description set, use it.
            title: againstData.opposed.description || undefined,

            previousMessageId,

            pool: DefaultValues.valueData({label: 'SR5.DicePool'}),
            limit: DefaultValues.valueData({label: 'SR5.Limit'}),
            threshold: DefaultValues.valueData({label: 'SR5.Threshold'}),
            values: {},

            sourceItemUuid: againstData.sourceItemUuid,
            against: againstData
        }

        // An opposing test will oppose net hits of the original / success test.
        // Register these as a threshold, which will trigger success/failure status
        // and calculate netHits accordingly.
        data.threshold.base = againstData.values.netHits.value;

        // Casting an opposed action doesn't give as complete ActionData from the original.
        // Therefore we must create an empty dummy action.
        let action = DefaultValues.actionData();

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
                const itemAction = await this._getDocumentTestAction(item, actor);
                action = TestCreator._mergeMinimalActionDataInOrder(action, itemAction);
            }
        }

        return await this._prepareActionTestData(action, actor, data);
    }

    /**
     * Overwrite SuccessTest#opposed behavior as an OpposedTest can't have another opposed test.
     */
    get opposed() {
        return false;
    }

    /**
     * Overwrite SuccessTest#opposing behavior as an OpposedTest is opposing another test.
     */
    get opposing() {
        return true;
    }

    /**
     * This test type can't be extended.
     */
    get canBeExtended() {
        return false;
    }

    /**
     * Opposed tests shouldn't show item description from the active tests source item.
     */
    get _canShowDescription(): boolean {
        return false;
    }

    /**
     * Opposed tests can't cause any blast template.
     */
    get _canPlaceBlastTemplate(): boolean {
        return false;
    }

    /**
     * Apply opposed test modifiers based on the item implementation
     */
    async prepareItemModifiers() {
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

    static async chatMessageListeners(message: ChatMessage, html, data) {
        html.find('.opposed-action').on('click', OpposedTest._castOpposedAction);
    }
}