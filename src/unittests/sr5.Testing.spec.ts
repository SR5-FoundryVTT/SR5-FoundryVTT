import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { TestCreator } from "../module/tests/TestCreator";
import { DataDefaults } from "@/module/data/DataDefaults";
import { ModifiableValue } from "@/module/mods/ModifiableValue";
import { TestDialog } from "../module/apps/dialogs/TestDialog";
import { FLAGS, SYSTEM_NAME } from "../module/constants";

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

        describe('limit usage UI state', () => {
            const COMMON_PARTIAL = 'systems/shadowrun5e/dist/templates/apps/dialogs/parts/success-test-common.hbs';

            // Extract just the limit field's input element from the rendered dialog markup.
            const renderLimitInput = async (test): Promise<string> => {
                const html = await foundry.applications.handlebars.renderTemplate(
                    COMMON_PARTIAL, { test, expandedPaths: [] } as any);
                return html.match(/<input[^>]*name="test\.data\.limit"[^>]*>/)?.[0] ?? '';
            };
            const manualLimitOverride = (test) =>
                test.limit.changes.find(change => change.name === 'SR5.ManualOverride');

            it('renders an applied limit (>0) as a normal editable number', async () => {
                const test = TestCreator.fromPool({ pool: 10, limit: 3 }, { showMessage: false, showDialog: false });
                assert.deepEqual(test.limitUsage, { infinity: false, disabled: false });

                const input = await renderLimitInput(test);
                assert.include(input, 'type="number"');
                assert.include(input, 'value="3"');
                assert.notInclude(input, 'limit-infinity');
                assert.notInclude(input, 'disabled');
            });

            it('renders a disabled infinity field when Push The Limit is active', async () => {
                const test = TestCreator.fromPool({ pool: 10, limit: 3 }, { showMessage: false, showDialog: false });
                test.data.pushTheLimit = true;
                assert.deepEqual(test.limitUsage, { infinity: true, disabled: true });

                const input = await renderLimitInput(test);
                assert.include(input, 'class="limit-infinity"');
                assert.include(input, 'value="∞"');
                assert.include(input, 'disabled');
                assert.include(input, 'data-tooltip="SR5.Tooltips.Test.LimitIgnored"');
            });

            it('renders a disabled infinity field when global limits are disabled', async () => {
                const previous = game.settings.get(SYSTEM_NAME, FLAGS.ApplyLimits);
                await game.settings.set(SYSTEM_NAME, FLAGS.ApplyLimits, false);
                try {
                    const test = TestCreator.fromPool({ pool: 10, limit: 3 }, { showMessage: false, showDialog: false });
                    assert.deepEqual(test.limitUsage, { infinity: true, disabled: true });

                    const input = await renderLimitInput(test);
                    assert.include(input, 'class="limit-infinity"');
                    assert.include(input, 'value="∞"');
                    assert.include(input, 'disabled');
                    assert.include(input, 'data-tooltip="SR5.Tooltips.Test.LimitIgnored"');
                } finally {
                    await game.settings.set(SYSTEM_NAME, FLAGS.ApplyLimits, previous);
                }
            });

            it('renders a literal 0 limit as an editable infinity field', async () => {
                const test = TestCreator.fromPool({ pool: 10, limit: 0 }, { showMessage: false, showDialog: false });
                assert.deepEqual(test.limitUsage, { infinity: true, disabled: false });

                const input = await renderLimitInput(test);
                assert.include(input, 'class="limit-infinity"');
                assert.include(input, 'value="∞"');
                assert.notInclude(input, 'disabled');
            });

            it('resets the limit to its computed value when the field is emptied', () => {
                const test = TestCreator.fromPool({ pool: 10, limit: 4 }, { showMessage: false, showDialog: false });
                const dialog = new TestDialog(test, [], {});

                // Override the limit, then clear the field to revert back to the computed value.
                dialog._updateData({ 'test.data.limit': '7' });
                assert.strictEqual(test.limit.value, 7);

                dialog._updateData({ 'test.data.limit': '' });
                assert.strictEqual(test.limit.value, 4);
                assert.isUndefined(manualLimitOverride(test));
            });

            it('submits the infinity symbol as an explicit 0 limit', () => {
                const test = TestCreator.fromPool({ pool: 10, limit: 4 }, { showMessage: false, showDialog: false });
                const dialog = new TestDialog(test, [], {});

                dialog._updateData({ 'test.data.limit': '7' });
                dialog._updateData({ 'test.data.limit': '∞' });
                assert.strictEqual(test.limit.value, 0);
                assert.strictEqual(manualLimitOverride(test)?.value, 0);
            });

            it('keeps an explicit 0 limit and renders it as ∞', async () => {
                const test = TestCreator.fromPool({ pool: 10, limit: 4 }, { showMessage: false, showDialog: false });
                const dialog = new TestDialog(test, [], {});

                dialog._updateData({ 'test.data.limit': '0' });
                assert.strictEqual(test.limit.value, 0);
                assert.strictEqual(manualLimitOverride(test)?.value, 0);
                assert.deepEqual(test.limitUsage, { infinity: true, disabled: false });

                const input = await renderLimitInput(test);
                assert.include(input, 'class="limit-infinity"');
                assert.include(input, 'value="∞"');
            });

            it('applies a numeric limit entry as an override', () => {
                const test = TestCreator.fromPool({ pool: 10, limit: 0 }, { showMessage: false, showDialog: false });
                const dialog = new TestDialog(test, [], {});

                dialog._updateData({ 'test.data.limit': '5' });
                assert.strictEqual(test.limit.value, 5);
            });

            it('ignores invalid non-empty limit text', () => {
                const test = TestCreator.fromPool({ pool: 10, limit: 4 }, { showMessage: false, showDialog: false });
                const dialog = new TestDialog(test, [], {});

                dialog._updateData({ 'test.data.limit': '6' });
                assert.strictEqual(test.limit.value, 6);

                dialog._updateData({ 'test.data.limit': 'not a number' });
                assert.strictEqual(test.limit.value, 6);
                assert.strictEqual(manualLimitOverride(test)?.value, 6);
            });
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
