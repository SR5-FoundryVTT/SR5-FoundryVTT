import {SR5TestingDocuments} from "./utils";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { TestCreator } from "../module/tests/TestCreator";
import { RangedAttackTest } from "../module/tests/RangedAttackTest";
import { SuccessTest } from "../module/tests/SuccessTest";

export const shadowrunSR5ActiveEffect = (context: QuenchBatchContext) => {
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

    describe('SR5ActiveEffect', () => {
        it('apply the custom modify mode', async () => {
            const actor = await testActor.create({type: 'character'});
            const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                label: 'Test Effect'
            }]);

            await effect[0].update({
                'changes': [{key: 'data.attributes.body.mod', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM},
                    {key: 'data.attributes.body', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM}]
            });

            assert.deepEqual(actor.system.attributes.body.mod, [{
                name: 'Test Effect',
                value: 2
            }, {name: 'Test Effect', value: 2}]);
            assert.strictEqual(actor.system.attributes.body.value, 4);

            await effect[0].update({
                'changes': [{key: 'data.attributes.body.mod', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM},
                    {key: 'data.attributes.body.mod', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM}]
            });
        });
        it('apply custom modify mode, none ModifiableValue should work as the add mode', async () => {
            const actor = await testActor.create({type: 'character'});
            const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                label: 'Test Effect'
            }]);
            await effect[0].update({
                'changes': [{
                    key: 'data.modifiers.global',
                    value: 3,
                    mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM
                }]
            });

            assert.strictEqual(actor.system.modifiers.global, 3);
            assert.strictEqual(actor.system.modifiers.global.mod, undefined);
            assert.strictEqual(actor.system.modifiers.global.override, undefined);


            it('apply the custom override mode', async () => {
                const actor = await testActor.create({type: 'character'});
                const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    label: 'Test Effect'
                }]);
                await effect[0].update({
                    'changes': [{key: 'data.attributes.body', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE},
                        {key: 'data.attributes.body.value', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE}]
                });

                assert.deepEqual(actor.system.attributes.body.override, {name: 'Test Effect', value: 3});
                assert.deepEqual(actor.system.attributes.body.mod, []);
                assert.strictEqual(actor.system.attributes.body.value, 3);
            });

            it('apply custom override mode, should override all existing .mod values', async () => {
                it('apply the custom override mode', async () => {
                    const actor = await testActor.create({type: 'character'});
                    const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                        origin: actor.uuid,
                        disabled: false,
                        label: 'Test Effect'
                    }]);
                    await effect[0].update({
                        'changes': [{key: 'data.attributes.body.mod', value: 5, mode: CONST.ACTIVE_EFFECT_MODES.ADD},
                            {key: 'data.attributes.body.value', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE}]
                    });

                    assert.strictEqual(actor.system.attributes.body.mod.length, 1);
                    assert.deepEqual(actor.system.attributes.body.override, {name: 'Test Effect', value: 3});
                    assert.deepEqual(actor.system.attributes.body.mod, [{name: 'Test Effect', value: 5}]);
                    assert.strictEqual(actor.system.attributes.body.value, 3);
                });
            });

            it('apply custom override mode, none ModifiableValue should work without altering anything', async () => {
                const actor = await testActor.create({type: 'character'});
                const effect = await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    label: 'Test Effect'
                }]);
                await effect[0].update({
                    'changes': [{
                        key: 'data.modifiers.global',
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
    describe('SR5AdvancedEffect', () => {
        it('Create an effect with a custom apply to target and assure applicability', async () => {
            const expectedFlags = {
                'shadowrun5e': {'applyTo': 'test'}
            }

            const actor = await testActor.create({type: 'character'});
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
                disabled: false,
                label: 'Test Effect',
                'flags': expectedFlags,
                'changes': [{key: 'data.limit', value: 3, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM}]
            }]);

            // Effects with a custom applyTo should not be applied to the actor.
            assert.lengthOf(effects, 1);
            assert.lengthOf(actor.effects.contents, 0);
            assert.lengthOf(weapon.effects.contents, 1);      

            const effect = effects.pop();

            // The effect should have the correct flags and applyTo.
            assert.deepEqual(effect.data.flags, expectedFlags);
            assert.equal(effect.applyTo, 'test');
        });

        it('Advanced effects with applyTo test should affect test values', async () => {
            const expectedFlags = {
                'shadowrun5e': {'applyTo': 'test'}
            }
            const limitValue = 3;
            const poolValue = 3;
            const hitsValue = 3;

            const actor = await testActor.create({type: 'character'});
            const items = await actor.createEmbeddedDocuments('Item', [{
                name: 'Test Item',
                type: 'action'
            }]);
            const weapon = items[0] as SR5Item;
            await weapon.createEmbeddedDocuments('ActiveEffect', [{
                origin: weapon.uuid,
                disabled: false,
                label: 'Test Effect',
                'flags': expectedFlags,
                'changes': [
                    {key: 'data.limit', value: limitValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM},
                    {key: 'data.pool', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM},
                    {key: 'data.values.hits', value: poolValue, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM}
                ]
            }]);

            const test = await TestCreator.fromItem(weapon, actor, {showDialog: false, showMessage: false}) as SuccessTest;
            
            test.prepareBaseValues();
            test.calculateBaseValues();
            test.calculateDerivedValues();

            assert.equal(test.limit.value, limitValue);
            assert.equal(test.pool.value, poolValue);
            assert.equal(test.hits.value, hitsValue);
        });
    });
}