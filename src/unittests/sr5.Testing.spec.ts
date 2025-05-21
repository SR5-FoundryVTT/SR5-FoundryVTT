import {SR5TestingDocuments} from "./utils";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import {TestCreator} from "../module/tests/TestCreator";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunTesting = (context: QuenchBatchContext) => {
    const {describe, it, before, after} = context;
    const assert: Chai.AssertStatic = context.assert;

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
        it('evaluate a roll from action data', async () => {
           const actionData = {
                'system.action.test': 'SuccessTest',
                'type': 'action',
                'system.action.type': 'simple',
                'system.action.attribute': 'body',
                'system.action.skill': 'automatics',
                'system.action.spec': false,
                'system.action.limit': {
                    base: 1,
                    value: 1,
                    attribute: 'physical',
                },
                'system.action.threshold': {
                    base: 1,
                    value: 1,
                },
                'system.action.damage': {
                    ap: {value: 5, base: 5, mod: Array(0)},
                    attribute: "",
                    base: 5,
                    base_formula_operator: "add",
                    element: {value: '', base: ''},
                    itemSource: {actorId: '', itemId: '', itemType: '', itemName: ''},
                    mod: [],
                    type: {value: 'physical', base: 'physical'},
                    value: 5
                }
            };

            const action = await testItem.create(actionData);

            const actorData = {'type': 'character',
                               'system.attributes.body.base': 5,
                               'system.skills.active.automatics.base': 45};
            const actor = await testActor.create(actorData);

            const test = await TestCreator.fromItem(action, actor, {showMessage: false, showDialog: false});

            // For a broken test just fail.v
            if (!test) assert.strictEqual(true, false);

            // Evaluate a working test.
            if (test) {
                await test.evaluate();

                assert.strictEqual(test.pool.value, 50); // 5 body, 45 automatics
                assert.strictEqual(test.threshold.value, 1); // 1
                assert.strictEqual(test.limit.value, 4); // 4 Physical + 1

                // TODO: Implement mocking for SR5Roll to test none-random results
            }
        });

        it('evaluate a roll from simple pool data', async () => {
            const test = TestCreator.fromPool({pool: 10}, {showMessage: false, showDialog: false});
            await test.evaluate();

            assert.strictEqual(test.pool.value, 10);
        });

        it('evaluate an opposed roll from a opposed action', async () => {
            const actionData = {
                'type': 'action',
                'data.action.test': 'SuccessTest',

                'data.action.type': 'simple',
                'data.action.attribute': 'body',
                'data.action.skill': 'automatics',
                'data.action.spec': false,
                'data.action.limit': {
                    base: 1,
                    value: 1,
                    attribute: 'physical',
                },
                'data.action.threshold': {
                    base: 1,
                    value: 1,
                },
                'data.action.opposed': {
                    "type": "custom",
                    // TODO: This could maybe simply be SuccessTest?
                    "test": "OpposedTest",
                    "attribute": "reaction",
                    "attribute2": "intuition",
                    "skill": "",
                    "mod": 0,
                    "description": ""
                }
            };

            const action = await testItem.create(actionData);
            const actorData = {'type': 'character',
                               'data.attributes.body.base': 5,
                               'data.skills.active.automatics.base': 45};
            const actor = await testActor.create(actorData);

            const test = await TestCreator.fromItem(action, actor, {showMessage: false, showDialog: false});

            if (test) {
                await test.toMessage();
            }
        });
    });

    describe('OpposedTest', () => {

    });
};