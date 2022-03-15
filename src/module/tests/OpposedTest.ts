import { SR5Actor } from "../actor/SR5Actor";
import {
    SuccessTest,
    SuccessTestData,
    TestOptions,
    SuccessTestValues,
    TestDocuments,
    TestData
} from "./SuccessTest";
import ValueField = Shadowrun.ValueField;
import {DefaultValues} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";


export interface OpposedTestValues extends SuccessTestValues {
}

export interface OpposedTestData extends
    TestData,
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
    public against: SuccessTest

    constructor(data, documents?: TestDocuments, options?: TestOptions) {
        super(data, documents, options);

        this.against = new SuccessTest(this.data.against);
        console.error(this.against);
    }

    async populateDocuments() {
        await super.populateDocuments();

        await this.against.populateDocuments();
    }

    static getMessageActionTestData(againstData: SuccessTestData, actor, previousMessageId: string): OpposedTestData|undefined {
        if (!againstData.opposed) {
            console.error(`Shadowrun 5e | Supplied test data doesn't contain an opposed action`, againstData);
            return;
        }
        // @ts-ignore // TODO: Typing here get's confused between boolean when it should be string.
        if (againstData.opposed.type !== 'custom') {
            console.error(`Shadowrun 5e | Supplied test defines a opposed test type ${againstData.opposed.type} but only type 'custom' is supported`);
            return;
        }
        if (!actor) {
            console.error(`Shadowrun 5e | Can't resolve opposed test values due to missing actor`);
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
            values: {
                pushTheLimit: DefaultValues.valueData({label: 'SR5.PushTheLimit'}),
                secondChance: DefaultValues.valueData({label: 'SR5.SecondChange'})
            },

            against: againstData
        }

        // An opposing test will oppose net hits of the opposed test.
        // Register these as a threshold, which will trigger success/failure status
        // and calculate netHits accordingly.
        data.threshold.base = againstData.values.netHits.value;

        // Try fetching the opposed action data.
        const {opposed} = againstData;

        if (opposed.skill && opposed.attribute) {
            // TODO: Handle skill testing rules.
            const skill = actor.getSkill(opposed.skill);
            if (skill) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, skill.label, skill.value, false);

            const attribute = actor.getAttribute(opposed.attribute);
            if (attribute) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, attribute.label, attribute.value, false);
        }

        if (!opposed.skill && opposed.attribute) {
            const attribute = actor.getAttribute(opposed.attribute);
            if (attribute) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, attribute.label, attribute.value, false);
        }
        if (!opposed.skill && opposed.attribute2) {
            const attribute = actor.getAttribute(opposed.attribute2);
            if (attribute) data.pool.mod = PartsList.AddUniquePart(data.pool.mod, attribute.label, attribute.value, false);
        }
        if (opposed.mod) {
            data.pool.base = Number(opposed.mod);
        }

        return data as OpposedTestData;
    }

    static chatMessageListeners(message: ChatMessage, html, data) {
        html.find('.opposed-action').on('click', (event) => OpposedTest._castOpposedAction(event, html));
    }
}