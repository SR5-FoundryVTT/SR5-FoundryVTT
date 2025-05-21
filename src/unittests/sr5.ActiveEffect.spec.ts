import { SR5TestingDocuments } from "./utils";
import { SR5Actor } from "../module/actor/SR5Actor";
import { SR5Item } from "../module/item/SR5Item";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { TestCreator } from "../module/tests/TestCreator";
import { SuccessTest } from "../module/tests/SuccessTest";
import { DataDefaults } from "../module/data/DataDefaults";
import { RangedAttackTest } from "../module/tests/RangedAttackTest";
import { SkillTest } from "../module/tests/SkillTest";
import { Helpers } from "../module/helpers";

export const shadowrunSR5ActiveEffect = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

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

    describe('SR5ActiveEffect', () => {
        it('MODIFY mode: apply system custom mode to main and sub value-keys', async () => {
            const actor = await testActor.create({ type: 'character' });
            const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                label: 'Test Effect',
                changes: [
                    { key: 'system.attributes.body.mod', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'system.attributes.body', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            assert.deepEqual(actor.system.attributes.body.mod, [
                {
                    name: 'Test Effect',
                    value: 2
                }, {
                    name: 'Test Effect',
                    value: 2
                }
            ]);
            assert.strictEqual(actor.system.attributes.body.value, 4);
        });

        it('MODIFY mode: check for add fallback when key points to none value property', async () => {
            const actor = await testActor.create({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                label: 'Test Effect',
                changes: [{
                    key: 'system.modifiers.global', // flat value field
                    value: 3,
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM
                }]
            }]);

            // change value should only ADD but NOT change .mod or .override
            assert.strictEqual(actor.system.modifiers.global, 3);
            assert.strictEqual(actor.system.modifiers.global.mod, undefined);
            assert.strictEqual(actor.system.modifiers.global.override, undefined);
        });

        it('OVERRIDE mode: apply the system override mode', async () => {
            const actor = await testActor.create({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                label: 'Test Effect',
                changes: [
                    { key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
                    { key: 'system.attributes.agility.value', value: 4, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
                    { key: 'system.skills.active.automatics.canDefault', value: false, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE }
                ]
            }]);

            // Body should be overwritten as a Valuefield.
            assert.deepEqual(actor.system.attributes.body.override, { name: 'Test Effect', value: 3 });
            assert.strictEqual(actor.system.attributes.body.base, 0);
            assert.deepEqual(actor.system.attributes.body.mod, []);
            assert.strictEqual(actor.system.attributes.body.value, 3);

            // Agility should be overwritten as a object property without system behavior.
            // However total will be calculated to be 1 again due to the systems ValueField flow
            assert.deepEqual(actor.system.attributes.agility.mod, []);
            assert.equal(actor.system.attributes.agility.override, undefined);
            assert.strictEqual(actor.system.attributes.agility.base, 0);
            assert.strictEqual(actor.system.attributes.agility.value, 1);

            // A ValueField value outside of value calculation should still work
            // Skill automatics normally can default, wich we overwrite here.
            assert.deepEqual(actor.system.skills.active.automatics.mod, []);
            assert.strictEqual(actor.system.skills.active.automatics.override, undefined);
            assert.strictEqual(actor.system.skills.active.automatics.canDefault, false);
        });

        it('OVERRIDE mode: override all existing .mod values', async () => {
            it('apply the custom override mode', async () => {
                const actor = await testActor.create({ type: 'character' });
                await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    label: 'Test Effect',
                    changes: [
                        { key: 'system.attributes.body', value: 5, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                        { key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE }
                    ]
                }]);

                assert.strictEqual(actor.system.attributes.body.mod.length, 1);
                assert.deepEqual(actor.system.attributes.body.override, { name: 'Test Effect', value: 3 });
                assert.deepEqual(actor.system.attributes.body.mod, [{ name: 'Test Effect', value: 5 }]);
                assert.strictEqual(actor.system.attributes.body.value, 3);
            });

            it('apply custom override mode, none ModifiableValue should work without altering anything', async () => {
                const actor = await testActor.create({ type: 'character' });
                const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    label: 'Test Effect'
                }]);
                await effect[0].update({
                    'changes': [{
                        key: 'system.modifiers.global',
                        value: 3,
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE
                    }]
                });

                assert.strictEqual(actor.system.modifiers.global, 3);
                assert.strictEqual(actor.system.modifiers.global.mod, undefined);
                assert.strictEqual(actor.system.modifiers.global.override, undefined);
            });
        });

    });
    /**
 * Tests around the systems 'advanced' effects on top of Foundry core active effects.
 */
    describe('SR5AdvancedEffect apply-to modes', () => {
        it('A default active effect should adhere to apply-to actor rules', async () => {
            const actor = await testActor.create({ type: 'character' });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect',
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            const effect = effects.pop();
            assert.strictEqual(effect.applyTo, 'actor');
        });

        it('Create an item effect and assert its not created on actor as until FoundryVTT v10', async () => {
            const actor = await testActor.create({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [{
                name: 'Test Item',
                type: 'weapon',
                system: {
                    category: 'range'
                }
            }]);
            const weapon = items[0];
            const effects = await weapon.createEmbeddedDocuments('ActiveEffect', [{
                origin: weapon.uuid,
                label: 'Test Effect',
                transfer: true, // Foundry uses transfer to find item effects that should be transferred. This is disabled by the system.
                changes: [{ key: 'system.limit', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            // Effects with a custom applyTo should not be applied to the actor.
            assert.lengthOf(effects, 1);
            assert.lengthOf(actor.effects.contents, 0);
            assert.lengthOf(weapon.effects.contents, 1);
        });

        it('ACTOR apply-to: Only actor and targeted_actor effects should apply onto an actor', async () => {
            const actor = await testActor.create({ type: 'character' });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Actor Effect',
                flags: { shadowrun5e: { applyTo: 'actor' } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }, {
                label: 'Targeted Actor Effect',
                flags: { shadowrun5e: { applyTo: 'targeted_actor' } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }, {
                label: 'Test_All Effect',
                flags: { shadowrun5e: { applyTo: 'test_all' } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }, {
                label: 'Test_Item Effect',
                flags: { shadowrun5e: { applyTo: 'test_item' } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }, {
                label: 'Modifiers Effect',
                flags: { shadowrun5e: { applyTo: 'modifiers' } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            assert.lengthOf(actor.effects.contents, 5);
            assert.lengthOf(actor.system.attributes.body.mod, 2);
            assert.equal(actor.system.attributes.body.value, 6);
        });

        it('TEST_ALL apply-to: Actor effect applies to test', async () => {
            const expectedFlags = {
                shadowrun5e: { applyTo: 'test_all' }
            }
            const limitValue = 3;
            const poolValue = 3;
            const hitsValue = 3;

            const actor = await testActor.create({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                label: 'Test Effect',
                flags: expectedFlags,
                'changes': [
                    // NOTE: test doesn't use system.
                    { key: 'data.limit', value: limitValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.values.hits', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);

            const action = DataDefaults.actionRollData({ test: 'SuccessTest' });

            const test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            await test.execute();

            assert.deepEqual(test.limit.mod, [{ name: 'Test Effect', value: limitValue }]);
            assert.equal(test.limit.value, limitValue);
            // SuccessTest will always include global and wounds modifier by default.
            assert.deepEqual(test.pool.mod, [
                { name: 'Test Effect', value: poolValue },
                { name: 'SR5.ModifierTypes.Global', value: 0 },
                { name: 'SR5.ModifierTypes.Wounds', value: 0 }]);
            assert.equal(test.pool.value, poolValue);
            assert.deepEqual(test.hits.mod, [{ name: 'Test Effect', value: hitsValue }]);
            assert.isAtLeast(test.hits.value, hitsValue);
        });

        it('TEST_ALL apply-to: Item effect applies to test', async () => {
            const expectedFlags = {
                shadowrun5e: { applyTo: 'test_all' }
            }
            const limitValue = 3;
            const poolValue = 3;
            const hitsValue = 3;

            const actor = await testActor.create({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [{ type: 'action', name: 'Test Action' }]);

            const item = items.pop();

            await item.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect',
                flags: expectedFlags,
                'changes': [
                    // NOTE: test doesn't use system.
                    { key: 'data.limit', value: limitValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.values.hits', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);

            const test = await TestCreator.fromItem(item, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            await test.execute();

            assert.deepEqual(test.limit.mod, [{ name: 'Test Effect', value: limitValue }]);
            assert.equal(test.limit.value, limitValue);
            // SuccessTest will always include global and wounds modifier by default.
            assert.deepEqual(test.pool.mod, [
                { name: 'Test Effect', value: poolValue },
                { name: 'SR5.ModifierTypes.Global', value: 0 },
                { name: 'SR5.ModifierTypes.Wounds', value: 0 }]);
            assert.equal(test.pool.value, poolValue);
            assert.deepEqual(test.hits.mod, [{ name: 'Test Effect', value: hitsValue }]);
            assert.isAtLeast(test.hits.value, hitsValue);
        });

        it('TEST_ITEM apply-to: Item effect applies only when on test item', async () => {
            const expectedFlags = {
                shadowrun5e: { applyTo: 'test_item' }
            }
            const limitValue = 3;
            const poolValue = 3;
            const hitsValue = 3;

            const actor = await testActor.create({ type: 'character' });

            // Create a effect on actor that should NOT apply.
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect Actor',
                flags: expectedFlags,
                changes: [
                    { key: 'data.limit', value: limitValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.values.hits', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);

            // Create one item that will carry the correct effect and one carries the wrong effect.
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'action', name: 'Test Action' },
                { type: 'action', name: 'Test Action 2' }]
            );

            const item = items.pop();

            // Create the correct effect on the correct item.
            await item.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect Correct Item',
                flags: expectedFlags,
                changes: [
                    { key: 'data.limit', value: limitValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.values.hits', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);

            const item2 = items.pop();

            // Create the wrong effect on the wrong item.
            await item2.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect Wrong Item',
                flags: expectedFlags,
                changes: [
                    { key: 'data.limit', value: limitValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.values.hits', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);


            // Test is created using the correct item.
            const test = await TestCreator.fromItem(item, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            await test.execute();

            assert.deepEqual(test.limit.mod, [{ name: 'Test Effect Correct Item', value: limitValue }]);
            assert.equal(test.limit.value, limitValue);
            // SuccessTest will always include global and wounds modifier by default.
            assert.deepEqual(test.pool.mod, [
                { name: 'Test Effect Correct Item', value: poolValue },
                { name: 'SR5.ModifierTypes.Global', value: 0 },
                { name: 'SR5.ModifierTypes.Wounds', value: 0 }]);
            assert.equal(test.pool.value, poolValue);
            assert.deepEqual(test.hits.mod, [{ name: 'Test Effect Correct Item', value: hitsValue }]);
            assert.isAtLeast(test.hits.value, hitsValue);
        });
    });

    describe('AdvancedEffects suppress application', () => {
        it('A disabled effect should not apply', async () => {
            const actor = await testActor.create({ type: 'character' });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect',
                disabled: true,
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            const effect = effects.pop();

            assert.isTrue(effect.disabled);
            assert.lengthOf(actor.effects.contents, 1);
            assert.lengthOf(actor.system.attributes.body.mod, 0);
        });

        it('A wireless only effect should not apply for a wireless item', async () => {
            const actor = await testActor.create({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'cyberware', name: 'Wireless Item', system: { technology: { wireless: true } } },
                { type: 'cyberware', name: 'Wired Item', system: { technology: { wireless: false } } }
            ]);

            const item = items.pop();
            await item.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect',
                flags: { shadowrun5e: { onlyForWireless: true } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            const item2 = items.pop();
            await item2.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect',
                flags: { shadowrun5e: { onlyForWireless: true } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            assert.lengthOf(actor.system.attributes.body.mod, 1);
            assert.equal(actor.system.attributes.body.value, 3);
        });

        it('A equipped only effect should not apply for an  unequipped item', async () => {
            const actor = await testActor.create({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'cyberware', name: 'Equipped Item', system: { technology: { equipped: true } } },
                { type: 'cyberware', name: 'Unequipped Item', system: { technology: { equipped: false } } }
            ]);

            const item = items.pop();
            await item.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect',
                flags: { shadowrun5e: { onlyForEquipped: true } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            const item2 = items.pop();
            await item2.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect',
                flags: { shadowrun5e: { onlyForEquipped: true } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            assert.lengthOf(actor.system.attributes.body.mod, 1);
            assert.equal(actor.system.attributes.body.value, 3);
        });

        it('A wireless and equipped only effect should not apply for a wired and unequipped item', async () => {
            const actor = await testActor.create({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'cyberware', name: 'Wireless Equipped Item', system: { technology: { equipped: true, wireless: true } } },
                { type: 'cyberware', name: 'Wired Unequipped Item', system: { technology: { equipped: false, wireless: false } } }
            ]);

            const item = items.pop();
            await item.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect',
                flags: { shadowrun5e: { onlyForEquipped: true, onlyForWireless: true } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            const item2 = items.pop();
            await item2.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect',
                flags: { shadowrun5e: { onlyForEquipped: true, onlyForeWireless: false } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            assert.lengthOf(actor.system.attributes.body.mod, 1);
            assert.equal(actor.system.attributes.body.value, 3);
        });

        it('A wireless and equipped only effect should if it is disabled', async () => {
            const actor = await testActor.create({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'cyberware', name: 'Wireless Equipped Item', system: { technology: { equipped: true, wireless: true } } },
            ]);

            const item = items.pop();
            await item.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect',
                disabled: true,
                flags: { shadowrun5e: { onlyForEquipped: true, onlyForWireless: true } },
                changes: [{ key: 'system.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            assert.lengthOf(actor.system.attributes.body.mod, 0);
            assert.equal(actor.system.attributes.body.value, 1);
        });

        it('A extended test should not apply effects on extended rolls', async () => {
            /**
             * Sum all modifier values for the given name.
             * 
             * @param name The modifier name
             * @returns the sum of all modifier values matching the name
             */
            const reduceModifiersByName = (name: string) => (acc: number, { name: n, value }) => n === name ? acc + value : acc;

            const actor = await testActor.create({ type: 'character' });
            let actions = await actor.createEmbeddedDocuments('Item', [{ name: 'Test Action', type: 'action' }]);
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Test Effect',
                flags: { shadowrun5e: { applyTo: 'test_all', selection_tests: "[{\"value\":\"Success Test\",\"id\":\"SuccessTest\"}]" } },
                changes: [{ key: 'data.pool', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            let test = await TestCreator.fromItem(actions[0], actor, { showDialog: false, showMessage: false }) as SuccessTest;
            await test.execute();

            // The first roll should have the effect applied
            assert.equal(test.pool.mod.reduce(reduceModifiersByName('Test Effect'), 0), 2);

            // Trigger the extended roll...
            test = await test.executeAsExtended();
            // ... assure effects aren't re applied but taken from the first roll.
            assert.equal(test.pool.mod.reduce(reduceModifiersByName('Test Effect'), 0), 2);

            actions = await actor.createEmbeddedDocuments('Item', [{ name: 'Test Action', type: 'action', 'system.action.extended': true }]);
            test = await TestCreator.fromItem(actions[0], actor, { showDialog: false, showMessage: false }) as SuccessTest;

            // This will trigger the first and all extended rolls...
            await test.execute();

            /// ... the test reference is for the first roll and should have the effect applied.
            assert.equal(test.pool.mod.reduce(reduceModifiersByName('Test Effect'), 0), 2);
        });
    });

    describe('AdvancedEffects with dynamic values', () => {
        it('ACTOR apply-to: Grab dynamic actor values', async () => {
            const actor = await testActor.create({ type: 'character', system: { modifiers: { global: 6 } } });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                label: 'Actor Effect',
                changes: [
                    { key: 'system.attributes.body', value: '@system.modifiers.global', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                ]
            }]);

            assert.lengthOf(actor.effects.contents, 1);
            assert.equal(actor.system.attributes.body.value, 6);
        });
    });

    /**
     * All these tests check for cases that caused issues in the past, due to specific implementation details
     * of some test implementations.
     */
    describe('Advanced effects modify problematic test implementations', () => {
        it('TEST modify damage on RangedAttackTest', async () => {
            const actor = await testActor.create({ type: 'character' });
            const weapon = await testItem.create({ type: 'weapon', system: { category: 'ranged' } });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                flags: { shadowrun5e: { applyTo: 'test_all' } },
                changes: [{ key: 'data.damage', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            const test = await TestCreator.fromItem(weapon, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            await test.execute();

            assert.equal(test.data.damage.value, 3);
        });

        it('TEST modify attribute and limit on SkillTest', async () => {
            const actor = await testActor.create({ type: 'character' });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                flags: { shadowrun5e: { applyTo: 'test_all' } },
                changes: [
                    { key: 'data.limit', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);

            //// @ts-expect-error DeepPartial fails for partial sub object literals
            const action = DataDefaults.actionRollData({ test: SkillTest.name, limit: {attribute: 'social'} });
            const test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false }) as SkillTest;

            // Simulate relevant part of #execute
            test.effects.applyAllEffects();

            test.prepareAttributeSelection();
            test.prepareLimitSelection();
            test.prepareBaseValues();
            test.calculateBaseValues();

            assert.strictEqual(test.limit.value, actor.getLimit('social').value + 3);
            assert.strictEqual(test.pool.value, 3);

            // Simulate change of selection
            test.data.attribute = 'body';
            test.data.limitSelection = 'physical';

            test.prepareAttributeSelection();
            test.prepareLimitSelection();
            test.prepareBaseValues();
            test.calculateBaseValues();

            assert.strictEqual(test.limit.value, actor.getLimit('physical').value + 3);
        });
    });
    
    describe('AdvanceEffects apply modification based on test categories', () => {
        it('Should apply modifier to a single category only', async () => {
            const actor = await testActor.create({ type: 'character' });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                flags: { shadowrun5e: { applyTo: 'test_all', selection_categories: '[{"value":"Social Actions","id":"social"}]' } },
                changes: [{ key: 'data.pool', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            // CASE - Test uses the same category
            let action = DataDefaults.actionRollData({ test: 'SkillTest', categories: ['social'] });
            let test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            // Simulate relevant part of #execute
            test.prepareTestCategories();
            test.effects.applyAllEffects();

            Helpers.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 3);

            // CASE - Test uses different category
            action = DataDefaults.actionRollData({ test: 'SkillTest', categories: ['matrix'] });
            test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            // Simulate relevant part of #execute
            test.prepareTestCategories();
            test.effects.applyAllEffects();

            Helpers.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 0);

            // CASE - Test uses no category
            action = DataDefaults.actionRollData({ test: 'SkillTest', categories: [] });
            test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            // Simulate relevant part of #execute
            test.prepareTestCategories();
            test.effects.applyAllEffects();

            Helpers.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 0);
        });
    })
};