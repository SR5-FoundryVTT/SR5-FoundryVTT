import {SR5TestingDocuments} from "./utils";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import {SuccessTest} from "../module/tests/SuccessTest";

export const shadowrunTesting = context => {
    const {describe, it, assert, before, after} = context;

    let testActor;
    let testItem;

    before(async () => {
        testActor = new SR5TestingDocuments(SR5Actor);
        testItem = new SR5TestingDocuments(SR5Item);
    })

    after(async () => {
        await testActor.teardown();
        await testItem.teardown();
    })

    describe('SuccessTest', () => {
        it('Should evaluate a roll from action data', async () => {
            /**
             * alt_mod: 0
             * attribute: "agility"
             * attribute2: "body"
             * category: ""
             * damage: {type: {…}, element: {…}, value: 5, base: 5, ap: {…}, …}
             * dice_pool_mod: []
             * extended: false
             * limit: {value: 5, base: 5, attribute: 'physical', mod: Array(0)}
             * mod: 5
             * mod_description: ""
             * opposed: {type: 'defense', attribute: '', attribute2: '', skill: '', mod: 0, …}
             * skill: "automatics"
             * spec: false
             * type: "simple"
             */
            const actionData = {'type': 'action',
                                'data.action.type': 'simple',
                                'data.action.attribute': 'body',
                                'data.action.skill': 'automatics',
                                'data.action.spec': false,
                                'data.action.limit': {
                                    base: 1,
                                    value: 1,
                                    attribute: 'physical',
                                    mod: []
                                }};

            const action = await testItem.create(actionData);

            const actorData = {'type': 'character',
                               'data.attributes.body.base': 5,
                               'data.skills.active.automatics.base': 5};
            const actor = await testActor.create(actorData);

            console.error('test');
            const test = SuccessTest.fromAction(action, actor);

            // For a broken test just fail.
            if (!test) assert.strictEqual(true, false);

            // Evaluate a working test.
            if (test) {
                await test.evaluate();

                const rollChat = await test.roll.toMessage();
                const testChat = await test.toMessage();

                assert.strictEqual(test.pool.value, 10);
                assert.strictEqual(test.threshold.value, 0);
                assert.strictEqual(test.limit.value, 4);

                assert.strictEqual(test.hasThreshold, false);
                assert.strictEqual(test.hasLimit, true);
            }
        });

        it('Should evaluate a roll from simple pool data', async () => {
            const test = SuccessTest.fromPool(10);
            await test.toMessage();

            assert.strictEqual(test.roll.pool, 10);
        });
    })
};