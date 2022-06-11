import {SuccessTest, SuccessTestData, SuccessTestValues, TestData, TestDocuments, TestOptions} from "./SuccessTest";
import {DefaultValues} from "../data/DataDefaults";
import {TestCreator} from "./TestCreator";
import {SR5Item} from "../item/SR5Item";


export interface OpposedTestValues extends SuccessTestValues {
}

export interface OpposedTestData extends
    TestData,
    // Remove unnecessary data points.
    Omit<SuccessTestData, 'opposed'>,
    Omit<SuccessTestData, 'targetActorsUuid'> {

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

        this.against = new SuccessTest(this.data.against);
    }

    // TODO: This could also be done with _prepareTypeData for only type specific fields.
    _prepareData(data, options?): any {
        data = super._prepareData(data, options);

        // Get opposed item reference as sometimes opposed test details depend on the item used for the active test.
        data.sourceItemUuid = data.against.sourceItemUuid;

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
        // @ts-ignore // TODO: Typing here get's confused between boolean when it should be string.
        if (againstData.opposed.type !== '') {
            console.error(`Shadowrun 5e | Supplied test defines a opposed test type ${againstData.opposed.type} but only type '' is supported`, this);
            return;
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

            against: againstData
        }

        // An opposing test will oppose net hits of the opposed test.
        // Register these as a threshold, which will trigger success/failure status
        // and calculate netHits accordingly.
        data.threshold.base = againstData.values.netHits.value;

        // Build the opposed action data
        const action = DefaultValues.actionData(this._getDefaultTestAction());
        let documentAction = DefaultValues.minimalActionData();
        if (againstData.sourceItemUuid) {
            const item = await fromUuid(againstData.sourceItemUuid) as SR5Item;
            documentAction = await this._getDocumentTestAction(item, actor);
        }

        // Overwrite defaults with user defined action data.
        action.skill = againstData.opposed.skill ||  documentAction.skill || action.skill;
        action.attribute = againstData.opposed.attribute || documentAction.attribute || action.attribute;
        action.attribute2 = againstData.opposed.attribute2 || documentAction.attribute2 || action.attribute2;
        action.mod = againstData.opposed.mod || documentAction.mod || action.mod;

        return await this._prepareActionTestData(action, actor, data);
    }

    /**
     * Overwrite SuccessTest#opposed behavior as an OpposedTest can't have another opposed test.
     */
    get opposed() {
        return false;
    }

    /**
     * Using a message action cast an opposed test to that messages active test.
     */
    static async _castOpposedAction(event, cardHtml) {
        event.preventDefault();

        // Collect information needed to create the opposed action test.
        const messageId = cardHtml.data('messageId');
        const opposedActionTest = $(event.currentTarget).data('action');

        await TestCreator.fromMessageAction(messageId, opposedActionTest);
    }

    static chatMessageListeners(message: ChatMessage, html, data) {
        html.find('.opposed-action').on('click', (event) => OpposedTest._castOpposedAction(event, html));
    }
}