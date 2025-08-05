import { SR5TestFactory } from "./utils";
import { Helpers } from "../module/helpers";
import { SR5Item } from "../module/item/SR5Item";
import { SkillTest } from "../module/tests/SkillTest";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { TestCreator } from "../module/tests/TestCreator";
import { SuccessTest } from "../module/tests/SuccessTest";
import { DataDefaults } from "../module/data/DataDefaults";
import { SR5ActiveEffect } from "src/module/effect/SR5ActiveEffect";

export const shadowrunSR5ActiveEffect = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    // TODO: taMiF Effects application of MODIFY (at least) is broken. We might have to fully replace ActiveEffect.apply()
    describe('SR5ActiveEffect', () => {
        it('MODIFY mode: apply system custom mode to main and sub value-keys', async () => {
            const actor = await factory.createActor({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                changes: [
                    { key: 'system.attributes.body.mod', value: '2', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'system.attributes.body', value: '2', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
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
            const actor = await factory.createActor({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                changes: [{
                    key: 'system.nuyen', // literal number field
                    value: '3',
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM
                }]
            }]);

            // change value should only ADD but NOT change .mod or .override
            assert.strictEqual(actor.system.nuyen, 3);
            // assert.strictEqual(actor.system.modifiers.global.mod, undefined);
            // assert.strictEqual(actor.system.modifiers.global.override, undefined);
        });

        it('OVERRIDE mode: apply the system override mode', async () => {
            const actor = await factory.createActor({ type: 'character' });

            // Assert overriden default values.
            assert.strictEqual(actor.system.skills.active.automatics.canDefault, true);

            await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                changes: [
                    { key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
                    { key: 'system.attributes.agility.value', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
                    { key: 'system.nuyen', value: '4', mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE },
                    { key: 'system.skills.active.automatics.canDefault', value: 'false', mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE }
                ]
            }]);

            // ModifiableValue should have a custom override value
            // Case - Direct change key
            assert.deepEqual(actor.system.attributes.body.override, { name: 'Test Effect', value: 3 });
            assert.strictEqual(actor.system.attributes.body.base, 0);
            assert.deepEqual(actor.system.attributes.body.mod, []);
            assert.strictEqual(actor.system.attributes.body.value, 3);
            // Case - Indirect change key
            assert.deepEqual(actor.system.attributes.agility.override, { name: 'Test Effect', value: 3 });
            assert.strictEqual(actor.system.attributes.agility.base, 0);
            assert.deepEqual(actor.system.attributes.agility.mod, []);
            assert.strictEqual(actor.system.attributes.agility.value, 3);

            // Case - ModifableValue with a direct key not part of value calculation (see SR5ActiveEffect.modifiableValueProperties)
            // Skill automatics normally can default, which we overwrite here.
            // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
            const active = actor.system.skills.active;
            assert.deepEqual(active.automatics.mod, []);
            assert.strictEqual(active.automatics.override, null);
            assert.strictEqual(active.automatics.canDefault, false);

            // Default literal value change
            assert.strictEqual(actor.system.nuyen, 4);
        });

        it('OVERRIDE mode: override all existing .mod values', async () => {
            it('apply the custom override mode', async () => {
                const actor = await factory.createActor({ type: 'character' });
                await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    name: 'Test Effect',
                    changes: [
                        { key: 'system.attributes.body', value: '5', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                        { key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE }
                    ]
                }]);

                assert.strictEqual(actor.system.attributes.body.mod.length, 1);
                assert.deepEqual(actor.system.attributes.body.override, { name: 'Test Effect', value: 3 });
                assert.deepEqual(actor.system.attributes.body.mod, [{ name: 'Test Effect', value: 5 }]);
                assert.strictEqual(actor.system.attributes.body.value, 3);
            });

            it('apply custom override mode, none ModifiableValue should work without altering anything', async () => {
                const actor = await factory.createActor({ type: 'character' });
                const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    name: 'Test Effect'
                }]);
                await effect[0]?.update({
                    changes: [{
                        key: 'system.modifiers.global',
                        value: '3',
                        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE
                    }]
                });

                assert.strictEqual(actor.system.modifiers.global, 3);
                // assert.strictEqual(actor.system.modifiers.global.mod, undefined);
                // assert.strictEqual(actor.system.modifiers.global.override, undefined);
            });
        });

    });
    /**
 * Tests around the systems 'advanced' effects on top of Foundry core active effects.
 */
    describe('SR5AdvancedEffect apply-to modes', () => {
        it('A default active effect should adhere to apply-to actor rules', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]) as SR5ActiveEffect[];

            const effect = effects.pop()!;
            assert.strictEqual(effect.system.applyTo, 'actor');
        });

        it('Create an item effect and assert its not created on actor as until FoundryVTT v10', async () => {
            const actor = await factory.createActor({ type: 'character' });
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
                name: 'Test Effect',
                transfer: true, // Foundry uses transfer to find item effects that should be transferred. This is disabled by the system.
                changes: [{ key: 'system.limit', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            // Effects with a custom applyTo should not be applied to the actor.
            assert.lengthOf(effects, 1);
            assert.lengthOf(actor.effects.contents, 0);
            assert.lengthOf(weapon.effects.contents, 1);
        });

        it('ACTOR apply-to: Only actor and targeted_actor effects should apply onto an actor', async () => {
            const actor = await factory.createActor({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Actor Effect',
                system: { applyTo: 'actor' },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }, {
                name: 'Targeted Actor Effect',
                system: { applyTo: 'targeted_actor' },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }, {
                name: 'Test_All Effect',
                system: { applyTo: 'test_all' },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }, {
                name: 'Test_Item Effect',
                system: { applyTo: 'test_item' },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }, {
                name: 'Modifiers Effect',
                system: { applyTo: 'modifier' },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            assert.lengthOf(actor.effects.contents, 5);
            assert.lengthOf(actor.system.attributes.body.mod, 2);
            assert.equal(actor.system.attributes.body.value, 6);
        });

        it('TEST_ALL apply-to: Actor effect applies to test', async () => { 
            const limitValue = 3;
            const poolValue = 3;
            const hitsValue = 3;

            const actor = await factory.createActor({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                name: 'Test Effect',
                system: { applyTo: 'test_all' },
                changes: [
                    // NOTE: test doesn't use system.
                    { key: 'data.limit', value: `${limitValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: `${poolValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.values.hits', value: `${poolValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);

            const action = DataDefaults.createData('action_roll', { test: 'SuccessTest' });

            const test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            await test.execute();

            assert.deepEqual(test.limit.mod, [{ name: 'Test Effect', value: limitValue }]);
            assert.equal(test.limit.value, limitValue);
            // SuccessTest will always include global and wounds modifier by default.
            assert.deepEqual(test.pool.mod, [
                { name: 'Test Effect', value: poolValue },
                { name: 'SR5.ModifierTypes.Global', value: 0 },
                { name: 'SR5.ModifierTypes.Wounds', value: 0 }
            ]);
            assert.equal(test.pool.value, poolValue);
            assert.deepEqual(test.hits.mod, [{ name: 'Test Effect', value: hitsValue }]);
            assert.isAtLeast(test.hits.value, hitsValue);
        });

        it('TEST_ALL apply-to: Item effect applies to test', async () => {
            const limitValue = 3;
            const poolValue = 3;
            const hitsValue = 3;

            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [{ type: 'action', name: 'Test Action' }]);

            const item = items.pop()!;

            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: { applyTo: 'test_all' },
                changes: [
                    // NOTE: test doesn't use system.
                    { key: 'data.limit', value: `${limitValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: `${poolValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.values.hits', value: `${poolValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);

            const test = await TestCreator.fromItem(item as SR5Item, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            await test.execute();

            assert.deepEqual(test.limit.mod, [{ name: 'Test Effect', value: limitValue }]);
            assert.equal(test.limit.value, limitValue);
            // SuccessTest will always include global and wounds modifier by default.
            assert.deepEqual(test.pool.mod, [
                { name: 'Test Effect', value: poolValue },
                { name: 'SR5.ModifierTypes.Global', value: 0 },
                { name: 'SR5.ModifierTypes.Wounds', value: 0 }
            ]);
            assert.equal(test.pool.value, poolValue);
            assert.deepEqual(test.hits.mod, [{ name: 'Test Effect', value: hitsValue }]);
            assert.isAtLeast(test.hits.value, hitsValue);
        });

        it('TEST_ITEM apply-to: Item effect applies only when on test item', async () => { 
            const limitValue = 3;
            const poolValue = 3;
            const hitsValue = 3;

            const actor = await factory.createActor({ type: 'character' });

            // Create a effect on actor that should NOT apply.
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect Actor',
                system: { applyTo: 'test_item' },
                changes: [
                    { key: 'data.limit', value: `${limitValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: `${poolValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.values.hits', value: `${poolValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);

            // Create one item that will carry the correct effect and one carries the wrong effect.
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'action', name: 'Test Action' },
                { type: 'action', name: 'Test Action 2' }
            ]);

            const item = items.pop()!;

            // Create the correct effect on the correct item.
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect Correct Item',
                system: { applyTo: 'test_item' },
                changes: [
                    { key: 'data.limit', value: `${limitValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: `${poolValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.values.hits', value: `${poolValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);

            const item2 = items.pop()!;

            // Create the wrong effect on the wrong item.
            await item2.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect Wrong Item',
                system: { applyTo: 'test_item' },
                changes: [
                    { key: 'data.limit', value: `${limitValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: `${poolValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.values.hits', value: `${poolValue}`, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);


            // Test is created using the correct item.
            const test = await TestCreator.fromItem(item as SR5Item, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            await test.execute();

            assert.deepEqual(test.limit.mod, [{ name: 'Test Effect Correct Item', value: limitValue }]);
            assert.equal(test.limit.value, limitValue);
            // SuccessTest will always include global and wounds modifier by default.
            assert.deepEqual(test.pool.mod, [
                { name: 'Test Effect Correct Item', value: poolValue },
                { name: 'SR5.ModifierTypes.Global', value: 0 },
                { name: 'SR5.ModifierTypes.Wounds', value: 0 }
            ]);
            assert.equal(test.pool.value, poolValue);
            assert.deepEqual(test.hits.mod, [{ name: 'Test Effect Correct Item', value: hitsValue }]);
            assert.isAtLeast(test.hits.value, hitsValue);
        });
    });

    describe('AdvancedEffects suppress application', () => {
        it('A disabled effect should not apply', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                disabled: true,
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            const effect = effects.pop()!;

            assert.isTrue(effect.disabled);
            assert.lengthOf(actor.effects.contents, 1);
            assert.lengthOf(actor.system.attributes.body.mod, 0);
        });

        it('A wireless only effect should not apply for a wireless item', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'cyberware', name: 'Wired Item', system: { technology: { wireless: 'none' } } },
                { type: 'cyberware', name: 'Wireless Item', system: { technology: { wireless: 'online' } } }
            ]);

            let item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: { onlyForWireless: true },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: { onlyForWireless: true },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            assert.lengthOf(actor.system.attributes.body.mod, 1);
            assert.equal(actor.system.attributes.body.value, 3);
        });

        it('A equipped only effect should not apply for an  unequipped item', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'cyberware', name: 'Equipped Item', system: { technology: { equipped: true } } },
                { type: 'cyberware', name: 'Unequipped Item', system: { technology: { equipped: false } } }
            ]);

            let item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: { onlyForEquipped: true },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: { onlyForEquipped: true },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            assert.lengthOf(actor.system.attributes.body.mod, 1);
            assert.equal(actor.system.attributes.body.value, 3);
        });

        it('A wireless and equipped only effect should not apply for a wired and unequipped item', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'cyberware', name: 'Wireless Equipped Item', system: { technology: { equipped: true, wireless: 'online' } } },
                { type: 'cyberware', name: 'Wired Unequipped Item', system: { technology: { equipped: false, wireless: 'offline' } } }
            ]);

            let item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: { onlyForEquipped: true, onlyForWireless: true },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: { onlyForEquipped: true, onlyForWireless: false },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            assert.lengthOf(actor.system.attributes.body.mod, 1);
            assert.equal(actor.system.attributes.body.value, 3);
        });

        it('A wireless and equipped only effect should not apply if it the effec titself disabled', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'cyberware', name: 'Wireless Equipped Item', system: { technology: { equipped: true, wireless: 'online' } } },
            ]);

            const item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                disabled: true,
                system: { onlyForEquipped: true, onlyForWireless: true },
                changes: [{ key: 'system.attributes.body', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            // The value will match the attribute min value (0) due to ValueField flow.
            assert.lengthOf(actor.system.attributes.body.mod, 0);
            assert.equal(actor.system.attributes.body.value, 0);
        });

        it('A extended test should not apply effects on extended rolls', async () => {
            /**
             * Sum all modifier values for the given name.
             * 
             * @param name The modifier name
             * @returns the sum of all modifier values matching the name
             */
            const reduceModifiersByName = (name: string) => (acc: number, { name: n, value }) => n === name ? acc + value : acc;

            const actor = await factory.createActor({ type: 'character' });
            let actions = await actor.createEmbeddedDocuments('Item', [{ name: 'Test Action', type: 'action' }]);
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: { applyTo: 'test_all', selection_tests: [{ value: "Success Test", id: "SuccessTest" }] },
                changes: [{ key: 'data.pool', value: '2', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            let test = await TestCreator.fromItem(actions[0] as SR5Item, actor, { showDialog: false, showMessage: false }) as SuccessTest;
            await test.execute();

            // The first roll should have the effect applied
            assert.equal(test.pool.mod.reduce(reduceModifiersByName('Test Effect'), 0), 2);

            // Trigger the extended roll...
            test = await test.executeAsExtended();
            // ... assure effects aren't re applied but taken from the first roll.
            assert.equal(test.pool.mod.reduce(reduceModifiersByName('Test Effect'), 0), 2);

            actions = await actor.createEmbeddedDocuments('Item', [{ name: 'Test Action', type: 'action', system: { action: { extended : true  } } }]);
            test = await TestCreator.fromItem(actions[0] as SR5Item, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            // This will trigger the first and all extended rolls...
            await test.execute();

            /// ... the test reference is for the first roll and should have the effect applied.
            assert.equal(test.pool.mod.reduce(reduceModifiersByName('Test Effect'), 0), 2);
        });
    });

    describe('AdvancedEffects with dynamic values', () => {
        it('ACTOR apply-to: Grab dynamic actor values', async () => {
            const actor = await factory.createActor({ type: 'character', system: { modifiers: { global: 6 } } });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Actor Effect',
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
            const actor = await factory.createActor({ type: 'character' });
            const weapon = await factory.createItem({ type: 'weapon', system: { category: 'range' } });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: { applyTo: 'test_all' },
                changes: [{ key: 'data.damage', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            const test = await TestCreator.fromItem(weapon, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            await test.execute();

            assert.equal(test.data.damage.value, 3);
        });

        it('TEST modify attribute and limit on SkillTest', async () => {
            const actor = await factory.createActor({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: { applyTo: 'test_all' },
                changes: [
                    { key: 'data.limit', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'data.pool', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);

            const action = DataDefaults.createData('action_roll', { test: SkillTest.name, limit: { attribute: 'social' } });
            const test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false }) as SkillTest;

            // Simulate relevant part of #execute
            test.effects.applyAllEffects();

            test.prepareAttributeSelection();
            test.prepareLimitSelection();
            test.prepareBaseValues();
            test.calculateBaseValues();

            assert.strictEqual(test.limit.value, actor.getLimit('social')!.value + 3);
            assert.strictEqual(test.pool.value, 3);

            // Simulate change of selection
            test.data.attribute = 'body';
            test.data.limitSelection = 'physical';

            test.prepareAttributeSelection();
            test.prepareLimitSelection();
            test.prepareBaseValues();
            test.calculateBaseValues();

            assert.strictEqual(test.limit.value, actor.getLimit('physical')!.value + 3);
        });
    });
    
    describe('AdvanceEffects apply modification based on test categories', () => {
        it('Should apply modifier to a single category only', async () => {
            const actor = await factory.createActor({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: { applyTo: 'test_all', selection_categories: [{ value: "Social Actions", id: "social"}] },
                changes: [{ key: 'data.pool', value: '3', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);

            // CASE - Test uses the same category
            let action = DataDefaults.createData('action_roll', { test: 'SkillTest', categories: ['social'] });
            let test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            // Simulate relevant part of #execute
            test.prepareTestCategories();
            test.effects.applyAllEffects();

            Helpers.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 3);

            // CASE - Test uses different category
            action = DataDefaults.createData('action_roll', { test: 'SkillTest', categories: ['matrix'] });
            test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            // Simulate relevant part of #execute
            test.prepareTestCategories();
            test.effects.applyAllEffects();

            Helpers.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 0);

            // CASE - Test uses no category
            action = DataDefaults.createData('action_roll', { test: 'SkillTest', categories: [] });
            test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false }) as SuccessTest;

            // Simulate relevant part of #execute
            test.prepareTestCategories();
            test.effects.applyAllEffects();

            Helpers.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 0);
        });
    })
};
