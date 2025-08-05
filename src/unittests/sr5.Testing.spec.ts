import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { TestCreator } from "../module/tests/TestCreator";
import { DataDefaults } from "@/module/data/DataDefaults";
import { Helpers } from "@/module/helpers";

export const shadowrunTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    describe('SuccessTest', () => {
        it('evaluate a roll from action data', async () => {
            const action = await factory.createItem({
                type: 'action',
                system: {
                    action: {
                        test: 'SuccessTest',
                        type: 'simple',
                        attribute: 'body',
                        skill: 'automatics',
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
                            base: 5,
                            type: { value: 'physical', base: 'physical' },
                            value: 5
                        }
                    }
                },
            });

            const actor = await factory.createActor({
                type: 'character',
                system: {
                    attributes: { body: { base: 5 }, strength: { base: 1 }, reaction: { base: 1 } },
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
        });

        it('evaluate a roll from simple pool data', async () => {
            const test = TestCreator.fromPool({pool: 10}, {showMessage: false, showDialog: false});
            await test.evaluate();

            assert.strictEqual(test.pool.value, 10);
        });

        it('evaluate an opposed roll from a opposed action', async () => {
            const action = await factory.createItem({
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
            const actor = await factory.createActor({
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
        });
    });

    describe('OpposedTest', () => {

    });

    
    /**
     * Testing around the TestCreator and SuccessTest getting their rolldata from an SR5Item instead of an SR5Actor.
     */
    describe('Item Based Testing', () => {
        it('Extract roll data from an SR5Item as source', async () => {
            const item = await factory.createItem({ type: 'host', system: { rating: 5 } });
            const action = DataDefaults.createData('action_roll', { attribute: 'willpower', attribute2: 'firewall' });
            const data = TestCreator._prepareTestDataWithActionForItem(action, item, TestCreator._minimalTestData());

            Helpers.calcTotal(data.pool);

            assert.strictEqual(data.pool.value, 10);
        });

        it('Use an source item to execute a test', async () => {
            const item = await factory.createItem({ type: 'host', system: { rating: 5 } });
            const action = DataDefaults.createData('action_roll', { attribute: 'willpower', attribute2: 'firewall' });
            const test = await TestCreator.fromAction(action, item, { showMessage: false, showDialog: false });
            await test?.execute();

            assert.equal(test?.data.evaluated, true);
            assert.equal(test?.data.pool.value, 10);
        });
    });
};