import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { TestCreator } from "../module/tests/TestCreator";
import { DataDefaults } from "@/module/data/DataDefaults";
import { ModifiableValue } from "@/module/mods/ModifiableValue";
import { NaturalRecoveryStunTest } from "@/module/tests/NaturalRecoveryStunTest";
import { NaturalRecoveryPhysicalTest } from "@/module/tests/NaturalRecoveryPhysicalTest";

export const shadowrunTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    describe('SuccessTest', () => {
        it('evaluate a roll from action data', async () => {
            window.doNotPopulateDefaultSkills = true;

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
                            ap: { value: 5, base: 5 },
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
                }
            });
            await actor.createEmbeddedDocuments('Item', [
                {
                    type: 'skill',
                    name: 'Automatics',
                    system: {
                        type: 'skill',
                        skill: {
                            attribute: 'agility',
                            rating: 45
                        }
                    }
                }
            ]);
            
            delete window.doNotPopulateDefaultSkills;

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

        it('marks manual-priority changes as manual modifiers', () => {
            const valueField = DataDefaults.createData('value_field', {
                label: 'SR5.DicePool',
                base: 10,
            });

            ModifiableValue.add(valueField, 'Custom Modifier', 3, {
                mode: 'ADD',
                priority: ModifiableValue.MANUAL_PRIORITY,
            });

            const createdChange = valueField.changes.find(change => change.name === 'Custom Modifier');
            if (!createdChange) assert.fail('Expected manual-priority modifier to exist');
            if (!createdChange) return;

            assert.strictEqual(createdChange.priority, ModifiableValue.MANUAL_PRIORITY);
            assert.isTrue(ModifiableValue.isManualChange(createdChange));
        });

        it('buy hits uses floor(pool / 4) and has no glitches', async () => {
            const test = TestCreator.fromPool({ pool: 10, limit: 2, threshold: 1 }, { showMessage: false, showDialog: false });
            test.data.buyHits = true;

            await test.evaluate();

            assert.strictEqual(test.boughtHits, 2);
            assert.strictEqual(test.hits.value, 2);
            assert.strictEqual(test.glitches.value, 0);
            assert.strictEqual(test.netHits.value, 1);
        });

        it('buy hits allows push the limit but blocks second chance', async () => {
            const test = TestCreator.fromPool({ pool: 8 }, { showMessage: false, showDialog: false });
            test.data.buyHits = true;

            assert.strictEqual(test.canPushTheLimit, true);
            assert.strictEqual(test.canSecondChance, false);
        });

        it('stores code term traces for labeled pool and limit parts', async () => {
            window.doNotPopulateDefaultSkills = true;

            const actor = await factory.createActor({
                type: 'character',
                system: {
                    attributes: {
                        agility: { base: 3 },
                        body: { base: 3 },
                        strength: { base: 3 },
                        reaction: { base: 3 }
                    },
                }
            });

            await actor.createEmbeddedDocuments('Item', [
                {
                    type: 'skill',
                    name: 'Archery',
                    system: {
                        type: 'skill',
                        skill: {
                            attribute: 'agility',
                            rating: 4
                        }
                    }
                }
            ]);
            
            delete window.doNotPopulateDefaultSkills;

            const action = DataDefaults.createData('action_roll', {
                test: 'SuccessTest',
                skill: 'archery',
                attribute: 'agility',
                spec: true,
                threshold: {
                    base: 3,
                    value: 3,
                },
                limit: {
                    attribute: 'physical',
                }
            });

            const test = await TestCreator.fromAction(action, actor, { showMessage: false, showDialog: false });
            if (!test) assert.fail('Expected success test to be created');
            if (!test) return;

            const traces = test.data.codeTermTraces;
            if (!traces) assert.fail('Expected code term traces to be present');
            if (!traces) return;

            assert.isAtLeast(traces.length, 3);

            assert.isTrue(traces.every(trace => {
                return typeof trace.tooltipSource === 'string'
                    && trace.valueField
                    && trace.tooltipSource.length > 0
                    && Array.isArray(trace.valueField.changes);
            }));

            assert.isTrue(test.codeTerms.pool.every(term => {
                return typeof term.tooltipSource === 'string' && term.tooltipSource.length > 0;
            }));

            assert.isTrue(test.codeTerms.threshold.every(term => !term.tooltipSource));
        });

        it('keeps the stun recovery threshold fixed on extended rolls', async () => {
            const actor = await factory.createActor({
                type: 'character',
                system: {
                    track: {
                        stun: { value: 5 }
                    }
                }
            });

            const test = new NaturalRecoveryStunTest(TestCreator._minimalTestData(), { actor }, { showMessage: false, showDialog: false });
            test.prepareBaseValues();
            test.calculateBaseValues();

            assert.strictEqual(test.threshold.value, 5);

            await actor.update({ system: { track: { stun: { value: 2 } } } });

            const extendedData = foundry.utils.duplicate(test.data);
            extendedData.extendedRoll = true;
            const extendedTest = new NaturalRecoveryStunTest(extendedData, { actor }, { showMessage: false, showDialog: false });
            extendedTest.prepareBaseValues();
            extendedTest.calculateBaseValues();

            assert.strictEqual(extendedTest.threshold.value, 5);
        });

        it('keeps the physical recovery threshold fixed on extended rolls', async () => {
            const actor = await factory.createActor({
                type: 'character',
                system: {
                    track: {
                        physical: { value: 6 }
                    }
                }
            });

            const test = new NaturalRecoveryPhysicalTest(TestCreator._minimalTestData(), { actor }, { showMessage: false, showDialog: false });
            test.prepareBaseValues();
            test.calculateBaseValues();

            assert.strictEqual(test.threshold.value, 6);

            await actor.update({ system: { track: { physical: { value: 3 } } } });

            const extendedData = foundry.utils.duplicate(test.data);
            extendedData.extendedRoll = true;
            const extendedTest = new NaturalRecoveryPhysicalTest(extendedData, { actor }, { showMessage: false, showDialog: false });
            extendedTest.prepareBaseValues();
            extendedTest.calculateBaseValues();

            assert.strictEqual(extendedTest.threshold.value, 6);
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

    
    /**
     * Testing around the TestCreator and SuccessTest getting their rolldata from an SR5Item instead of an SR5Actor.
     */
    describe('Item Based Testing', () => {
        it('Extract roll data from an SR5Item as source', async () => {
            const item = await factory.createItem({ type: 'host', system: { rating: 5 } });
            const action = DataDefaults.createData('action_roll', { attribute: 'willpower', attribute2: 'firewall' });
            const data = TestCreator._prepareTestDataWithActionForItem(action, item, TestCreator._minimalTestData());

            ModifiableValue.calcTotal(data.pool);

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
