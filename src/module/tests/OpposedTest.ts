import { SR5Actor } from "../actor/SR5Actor";
import {SuccessTest, SuccessTestData, SuccessTestOptions} from "./SuccessTest";
import ValueField = Shadowrun.ValueField;
import {DefaultValues} from "../data/DataDefaults";
import {PartsList} from "../parts/PartsList";


interface OpposedTestData {
    title?: string
    type?: string

    // The message id of the opposed test.
    previousMessageId: string

    // The item id that original action is sourced from.
    sourceItemUuid?: string
    // The actor id that is casting this test.
    sourceActorUuid?: string

    pool: ValueField
    threshold: ValueField
    limit: ValueField
    values: Record<string, ValueField>

    against: SuccessTestData
}
/**
 * An opposed test results from a normal success test as an opposed action.
 *
 * TODO: Need's a way to get the actor (either from selection or target)
 * TODO: What to actually overwrite?
 */
export class OpposedTest extends SuccessTest {
    public data: OpposedTestData;

    /**
     * An opposed test assumes it's opposing another SuccessTest, which might have resulted from an item action
     * or same or different actor.
     *
     * @param data
     * @param documents
     * @param options
     */
    // static fromTestData(data: SuccessTestData, documents, options?: SuccessTestOptions): OpposedTest {
    //     const opposedData = {
    //         // If the first test is a social test, the opposed would also be.
    //         type: data.type,
    //
    //         // The active documents for this test, both item and actor
    //         // For opposed tests the item might be sourced from a different actor.
    //         sourceItemUuid: data.sourceItemUuid,
    //         sourceActorUuid: documents?.actor?.uuid || data.sourceActorUuid,
    //
    //         against: data
    //     };
    //
    //     return new OpposedTest(data, {}, options);
    // }

    // static getActionTestData(item, actor): OpposedTestData {
    //     return {};
    // }

    /**
     * Create test data for an Opposed Test message action.
     *
     * @param againstData The original test cast to test against.
     * @param actor The actor to resolve values of the opposed action against.
     * @param previousMessageId
     */
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
        const data: OpposedTestData = {
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

        return data;
    }

    static chatMessageListeners(message: ChatMessage, html, data) {
        html.find('.opposed-action').on('click', (event) => OpposedTest._castOpposedAction(event, html));
    }
}