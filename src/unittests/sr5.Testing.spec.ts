import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import {TestCreator} from "../module/tests/TestCreator";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunTesting = (context: QuenchBatchContext) => {
    const {describe, it, before, after} = context;
    const assert: Chai.AssertStatic = context.assert;

    before(async () => {})
    after(async () => {})

    describe('SuccessTest', () => {
        it('evaluate a roll from action data', async () => {
            const action = new SR5Item<'action'>({
                type: 'action',
                system: {
                    action: {
                        test: 'SuccessTest',
                        type: 'simple',
                        attribute: 'body',
                        skill: 'automatics',
                        spec: false,
                        limit: {
                            base: 1,
                            value: 1,
                            attribute: 'physical',
                        },
                        threshold: {
                            base: 1,
                            value: 1,
                        },
                        damage: {
                            ap: { value: 5, base: 5, mod: [] },
                            attribute: "",
                            base: 5,
                            base_formula_operator: "add",
                            element: { value: '', base: '' },
                            // itemSource: { actorId: '', itemId: '', itemType: '', itemName: '' },
                            mod: [],
                            type: { value: 'physical', base: 'physical' },
                            value: 5
                        }
                    }
                },
            });

            const actor = new SR5Actor<'character'>({
                type: 'character',
                system: {
                    attributes: { body: { base: 5 } },
                    skills: { active: { automatics: { base: 45 } } }
                }
            });

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

            await action.delete();
            await actor.delete();
        });

        it('evaluate a roll from simple pool data', async () => {
            const test = TestCreator.fromPool({pool: 10}, {showMessage: false, showDialog: false});
            await test.evaluate();

            assert.strictEqual(test.pool.value, 10);
        });

        it('evaluate an opposed roll from a opposed action', async () => {
            const action = new SR5Item<'action'>({
                type: 'action',
                system: {
                    action: {
                        test: 'SuccessTest',
                        type: 'simple',
                        attribute: 'body',
                        skill: 'automatics',
                        spec: false,
                        limit: {
                            base: 1,
                            value: 1,
                            attribute: 'physical',
                        },
                        threshold: {
                            base: 1,
                            value: 1,
                        },
                        opposed: {
                            type: 'custom',
                            test: 'OpposedTest',
                            attribute: 'reaction',
                            attribute2: 'intuition',
                            skill: '',
                            description: ''
                        }
                    }
                }
            });
            const actor = new SR5Actor<'character'>({
                type: 'character',
                system: {
                    attributes: { body: { base: 5 } },
                    skills: { active: { automatics: { base: 45 } } }
                }
            });

            const test = await TestCreator.fromItem(action, actor, {showMessage: false, showDialog: false});

            if (test) {
                await test.toMessage();
            }

            await action.delete();
            await actor.delete();
        });
    });

    describe('OpposedTest', () => {

    });
};