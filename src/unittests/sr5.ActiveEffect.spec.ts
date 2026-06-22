import { SR5TestFactory } from './utils';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { SkillTest } from '../module/tests/SkillTest';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { TestCreator } from '../module/tests/TestCreator';
import { OpposedTest } from '../module/tests/OpposedTest';
import { ActionRollType } from 'src/module/types/item/Action';
import { DataDefaults } from '../module/data/DataDefaults';
import { SR5ActiveEffect } from 'src/module/effect/SR5ActiveEffect';
import { ModifiableValueType } from '@/module/types/template/Base';

export const shadowrunSR5ActiveEffect = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    /**
     * Helper to create a standardized change object for testing.
     * @param value The value to apply in the change.
     * @param mode The effect mode (default: ADD).
     * @param priority The priority for the change (default: mode * 10).
     * @returns The change object.
     */
    const createTestChange = (effect: SR5ActiveEffect, id: number): ModifiableValueType['changes'][number] => {
        const change = effect.system.changes[id];
        return DataDefaults.createData('change_entry', {
            name: effect.name,
            value: parseInt(String(change.value)),
            type: change.type,
            priority: parseInt(String(change.priority)),
            source: effect.uuid,
        });
    };

    /**
     * Create a character with deterministic zero-rated, defaultable active skills.
     * These tests must not depend on the world's configured skill compendia.
     */
    const createCharacterWithSkills = async (skills: string[]) => {
        const previousSkipDefaultSkills = window.doNotPopulateDefaultSkills;
        window.doNotPopulateDefaultSkills = true;

        try {
            return await factory.createActor({
                type: 'character',
                items: skills.map(name => ({
                    name,
                    type: 'skill',
                    system: {
                        type: 'skill',
                        skill: {
                            category: 'active',
                            rating: 0,
                            defaulting: true,
                            attribute: 'agility',
                        },
                    },
                })),
            });
        } finally {
            if (previousSkipDefaultSkills === undefined) delete window.doNotPopulateDefaultSkills;
            else window.doNotPopulateDefaultSkills = previousSkipDefaultSkills;
        }
    };

    describe('SR5ActiveEffect', () => {
        it('MODIFY mode: apply system custom mode to main and sub value-keys', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                system: {
                    changes: [
                        { key: 'system.attributes.body.changes', value: '2', type: 'add' },
                        { key: 'system.attributes.body', value: '2', type: 'add' }
                    ]
                }
            }]);

            assert.deepEqual(actor.system.attributes.body.changes, [
                createTestChange(effects[0], 0),
                createTestChange(effects[0], 1),
            ]);
            assert.strictEqual(actor.system.attributes.body.value, 4);
        });

        it('OVERRIDE mode: apply the system override mode', async () => {
            const actor = await createCharacterWithSkills(['Automatics']);

            // Assert overridden default values.
            assert.strictEqual(actor.system.skills.active.automatics.canDefault, true);

            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                system: {
                    changes: [
                        { key: 'system.attributes.body', value: '3', type: 'override' },
                        { key: 'system.attributes.agility.value', value: '3', type: 'override' },
                        { key: 'system.nuyen', value: '4', type: 'override' },
                        { key: 'system.skills.active.automatics.canDefault', value: 'false', type: 'override' },
                    ]
                }
            }]);

            // ModifiableValue should have a custom override value
            // Case - Direct change key
            assert.deepEqual(actor.system.attributes.body.changes, [createTestChange(effects[0], 0)]);
            assert.strictEqual(actor.system.attributes.body.base, 0);
            assert.strictEqual(actor.system.attributes.body.value, 3);
            // Case - Indirect change key
            assert.deepEqual(actor.system.attributes.agility.changes, [createTestChange(effects[0], 1)]);
            assert.strictEqual(actor.system.attributes.agility.base, 0);
            assert.strictEqual(actor.system.attributes.agility.value, 3);

            // Case - ModifiableValue with a direct key not part of value calculation (see SR5ActiveEffect.modifiableValueProperties)
            // Skill automatics normally can default, which we overwrite here.
            // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
            const active = actor.system.skills.active;
            assert.deepEqual(active.automatics.changes, []);
            assert.strictEqual(active.automatics.canDefault, false);

            // Default literal value change
            assert.strictEqual(actor.system.nuyen, 4);
        });

        it('OVERRIDE mode: override all existing .mod values', () => {
            it('apply the custom override mode', async () => {
                const actor = await factory.createActor({ type: 'character' });
                const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                    origin: actor.uuid,
                    disabled: false,
                    name: 'Test Effect',
                    system: {
                        changes: [
                            { key: 'system.attributes.body', value: '5', type: 'add' },
                            { key: 'system.attributes.body', value: '3', type: 'override' },
                        ]
                    }
                }]);

                assert.strictEqual(actor.system.attributes.body.changes.length, 2);
                assert.deepEqual(actor.system.attributes.body.changes, [
                    createTestChange(effects[0], 0),
                    createTestChange(effects[0], 1),
                ]);
                assert.strictEqual(actor.system.attributes.body.value, 3);
            });

            it('apply custom override mode, none ModifiableValue should work without altering anything', async () => {
                const actor = await factory.createActor({ type: 'character' });
                const effect = await actor.createEmbeddedDocuments('ActiveEffect', [
                    {
                        origin: actor.uuid,
                        disabled: false,
                        name: 'Test Effect',
                    },
                ]);
                await effect[0]?.update({
                    system: {
                        changes: [{
                            key: 'system.modifiers.global',
                            value: '3',
                            type: 'override',
                        }]
                    },
                });

                assert.strictEqual(actor.system.modifiers.global, 3);
            });
        });

        it('ADD mode: adding to ModifiableField should cause MODIFY mode to be used', async () => {
            const actor = await createCharacterWithSkills(['Automatics']);

            assert.strictEqual(actor.system.attributes.body.value, 0);
            assert.strictEqual(actor.system.skills.active.automatics.value, 0);

            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                system: {
                    changes: [
                        { key: 'system.attributes.body', value: '3', type: 'add' },
                        { key: 'system.skills.active.automatics', value: '3', type: 'add' },
                    ],
                }
            }]);

            assert.strictEqual(actor.system.attributes.body.value, 3);
            assert.deepEqual(actor.system.attributes.body.changes, [createTestChange(effects[0], 0)]);
            assert.strictEqual(actor.system.skills.active.automatics.value, 3);
            assert.deepEqual(actor.system.skills.active.automatics.changes, [createTestChange(effects[0], 1)]);
        });

        it('ADD mode: adding to ModifiableField property should cause MODIFY mode to be used', async () => {
            const actor = await createCharacterWithSkills(['Automatics']);

            assert.strictEqual(actor.system.attributes.body.value, 0);
            assert.strictEqual(actor.system.skills.active.automatics.value, 0);

            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                system: {
                    changes: [
                        { key: 'system.attributes.body.value', value: '3', type: 'add' },
                        { key: 'system.skills.active.automatics.value', value: '3', type: 'add' },
                    ]
                }
            }]);

            assert.strictEqual(actor.system.attributes.body.value, 3);
            assert.deepEqual(actor.system.attributes.body.changes, [createTestChange(effects[0], 0)]);
            assert.strictEqual(actor.system.skills.active.automatics.value, 3);
            assert.deepEqual(actor.system.skills.active.automatics.changes, [createTestChange(effects[0], 1)]);
        });

        it('UPGRADE mode: should raise the value to a max', async () => {
            window.doNotPopulateDefaultSkills = true;

            const actor = await factory.createActor({
                type: 'character',
                system: {
                    attributes: { body: { base: 2 } },
                },
            });
            delete window.doNotPopulateDefaultSkills;

            await actor.createEmbeddedDocuments('Item', [{
                type: 'skill',
                name: 'Automatics',
                system: {
                    type: 'skill',
                    skill: {
                        attribute: 'agility',
                        rating: 2,
                    }
                }
            }]);

            assert.strictEqual(actor.system.attributes.body.base, 2);
            assert.strictEqual(actor.system.skills.active.automatics.base, 2);

            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                system: {
                    changes: [
                        { key: 'system.skills.active.automatics.value', value: '3', type: 'upgrade' },
                        { key: 'system.attributes.body.value', value: '3', type: 'upgrade' },
                    ]
                }
            }]);

            assert.strictEqual(actor.system.attributes.body.value, 3);
            assert.deepEqual(actor.system.attributes.body.changes, [createTestChange(effects[0], 0)]);
            assert.strictEqual(actor.system.skills.active.automatics.value, 3);
            assert.deepEqual(actor.system.skills.active.automatics.changes, [createTestChange(effects[0], 1)]);
        });

        it('UPGRADE mode: uses the highest value for multiple upgrade changes', async () => {
            window.doNotPopulateDefaultSkills = true;

            const actor = await factory.createActor({ type: 'character' });
            //
            delete window.doNotPopulateDefaultSkills;

            await actor.createEmbeddedDocuments('Item', [{
                type: 'skill',
                name: 'Automatics',
                system: {
                    type: 'skill',
                    skill: {
                        attribute: 'agility',
                        rating: 2,
                    }
                }
            }]);

            assert.strictEqual(actor.system.skills.active.automatics.base, 2);

            await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                system: {
                    changes: [
                        { key: 'system.skills.active.automatics.value', value: '5', type: 'upgrade' },
                        { key: 'system.skills.active.automatics.value', value: '3', type: 'upgrade' },
                    ]
                }
            }]);

            assert.strictEqual(actor.system.skills.active.automatics.value, 5);
        });

        it('DOWNGRADE mode: should reduce the value to a min', async () => {
            window.doNotPopulateDefaultSkills = true;
            const actor = await factory.createActor({
                type: 'character',
                system: {
                    attributes: { body: { base: 5 } },
                },
            });
            delete window.doNotPopulateDefaultSkills;

            await actor.createEmbeddedDocuments('Item', [{
                type: 'skill',
                name: 'Automatics',
                system: {
                    type: 'skill',
                    skill: {
                        attribute: 'agility',
                        rating: 5,
                    }
                }
            }]);

            assert.strictEqual(actor.system.attributes.body.base, 5);
            assert.strictEqual(actor.system.skills.active.automatics.base, 5);

            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                system: {
                    changes: [
                        { key: 'system.skills.active.automatics.value', value: '3', type: 'downgrade' },
                        { key: 'system.attributes.body.value', value: '3', type: 'downgrade' },
                    ]
                }
            }]);

            assert.strictEqual(actor.system.attributes.body.value, 3);
            assert.deepEqual(actor.system.attributes.body.changes, [createTestChange(effects[0], 0)]);
            assert.strictEqual(actor.system.skills.active.automatics.value, 3);
            assert.deepEqual(actor.system.skills.active.automatics.changes, [createTestChange(effects[0], 1)]);
        });

        it('DOWNGRADE mode: uses the lowest value for multiple downgrade changes', async () => {
            window.doNotPopulateDefaultSkills = true;
            const actor = await factory.createActor({ type: 'character' });
            delete window.doNotPopulateDefaultSkills;

            await actor.createEmbeddedDocuments('Item', [{
                type: 'skill',
                name: 'Automatics',
                system: {
                    type: 'skill',
                    skill: {
                        attribute: 'agility',
                        rating: 6,
                    }
                }
            }]);

            await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                system: {
                    changes: [
                        { key: 'system.skills.active.automatics.value', value: '3', type: 'downgrade' },
                        { key: 'system.skills.active.automatics.value', value: '5', type: 'downgrade' },
                    ]
                }
            }]);

            assert.strictEqual(actor.system.skills.active.automatics.value, 3);
        });

        it('MULTIPLY mode: multiplies base values by the change value', async () => {
            window.doNotPopulateDefaultSkills = true;
            const actor = await factory.createActor({
                type: 'character',
                system: {
                    attributes: { body: { base: 5 } },
                },
            });
            delete window.doNotPopulateDefaultSkills;

            await actor.createEmbeddedDocuments('Item', [{
                type: 'skill',
                name: 'Automatics',
                system: {
                    type: 'skill',
                    skill: {
                        attribute: 'agility',
                        rating: 5,
                    }
                }
            }]);

            assert.strictEqual(actor.system.attributes.body.base, 5);
            assert.strictEqual(actor.system.skills.active.automatics.base, 5);

            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                system: {
                    changes: [
                        { key: 'system.skills.active.automatics.value', value: '3', type: 'multiply' },
                        { key: 'system.attributes.body.value', value: '3', type: 'multiply' },
                    ]
                }
            }]);

            assert.strictEqual(actor.system.attributes.body.value, 15);
            assert.deepEqual(actor.system.attributes.body.changes, [createTestChange(effects[0], 0)]);
            assert.strictEqual(actor.system.skills.active.automatics.value, 15);
            assert.deepEqual(actor.system.skills.active.automatics.changes, [createTestChange(effects[0], 1)]);
        });

        it('SUBTRACT mode: subtracts the change value from base values', async () => {
            window.doNotPopulateDefaultSkills = true;
            const actor = await factory.createActor({
                type: 'character',
                system: {
                    attributes: { body: { base: 5 } },
                },
            });
            delete window.doNotPopulateDefaultSkills;

            await actor.createEmbeddedDocuments('Item', [{
                type: 'skill',
                name: 'Automatics',
                system: {
                    type: 'skill',
                    skill: {
                        attribute: 'agility',
                        rating: 5,
                    }
                }
            }]);

            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                disabled: false,
                name: 'Test Effect',
                system: {
                    changes: [
                        { key: 'system.skills.active.automatics.value', value: '3', type: 'subtract' },
                        { key: 'system.attributes.body.value', value: '3', type: 'subtract' },
                    ]
                }
            }]);

            assert.strictEqual(actor.system.attributes.body.value, 2);
            assert.deepEqual(actor.system.attributes.body.changes, [createTestChange(effects[0], 0)]);
            assert.strictEqual(actor.system.skills.active.automatics.value, 2);
            assert.deepEqual(actor.system.skills.active.automatics.changes, [createTestChange(effects[0], 1)]);
        });
    });
    /**
     * Tests around the systems 'advanced' effects on top of Foundry core active effects.
     */
    describe('SR5AdvancedEffect apply-to modes', () => {
        it('A default active effect should adhere to apply-to actor rules', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const effects = (await actor.createEmbeddedDocuments('ActiveEffect', [{
                system: { changes: [{ key: 'system.attributes.body', value: '3', type: 'add' }] },
                name: 'Test Effect',
            }])) as SR5ActiveEffect[];

            const effect = effects.pop()!;
            assert.strictEqual(effect.system.targets[0].applyTo, 'actor');
        });

        it('Create an item effect and assert its not created on actor as until FoundryVTT v10', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [{
                name: 'Test Item',
                type: 'weapon',
                system: { category: 'range' }
            }]);
            const weapon = items[0];
            const effects = await weapon.createEmbeddedDocuments('ActiveEffect', [{
                origin: weapon.uuid,
                name: 'Test Effect',
                transfer: true, // Foundry uses transfer to find item effects that should be transferred. This is disabled by the system.
                system: { changes: [{ key: 'system.limit', value: '3', type: 'add' }] },
            }]);

            // Effects with a custom applyTo should not be applied to the actor.
            assert.lengthOf(effects, 1);
            assert.lengthOf(actor.effects.contents, 0);
            assert.lengthOf(weapon.effects.contents, 1);
        });

        it('ACTOR apply-to: Only actor and targeted_actor effects should apply onto an actor', async () => {
            const actor = await factory.createActor({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [
                {
                    name: 'Actor Effect',
                    system: {
                        changes: [{ key: 'system.attributes.body', value: '3', type: 'add', target: 't' }],
                        targets: [{ id: 't', applyTo: 'actor' }],
                    },
                },
                {
                    name: 'Targeted Actor Effect',
                    system: {
                        changes: [{ key: 'system.attributes.body', value: '3', type: 'add', target: 't' }],
                        targets: [{ id: 't', applyTo: 'targeted_actor' }],
                    },
                },
                {
                    name: 'Test_All Effect',
                    system: {
                        changes: [{ key: 'system.attributes.body', value: '3', type: 'add', target: 't' }],
                        targets: [{ id: 't', applyTo: 'test_all' }],
                    },
                },
                {
                    name: 'Test_Item Effect',
                    system: {
                        changes: [{ key: 'system.attributes.body', value: '3', type: 'add', target: 't' }],
                        targets: [{ id: 't', applyTo: 'test_item' }],
                    },
                },
                {
                    name: 'Incoming Test Effect',
                    system: {
                        changes: [{ key: 'system.attributes.body', value: '3', type: 'add', target: 't' }],
                        targets: [{ id: 't', applyTo: 'test_target' }],
                    },
                },
                {
                    name: 'Modifiers Effect',
                    system: {
                        changes: [{ key: 'system.attributes.body', value: '3', type: 'add', target: 't' }],
                        targets: [{ id: 't', applyTo: 'modifier' }],
                    },
                },
            ]);

            assert.lengthOf(actor.effects.contents, 6);
            assert.lengthOf(actor.system.attributes.body.changes, 2);
            assert.equal(actor.system.attributes.body.value, 6);
        });

        it('TARGETED_ACTOR apply-to: create copied effects with resolved values on the target actor', async () => {
            const attacker = await factory.createActor({
                type: 'character',
                system: {
                    attributes: { body: { base: 2 } },
                    skills: { active: { automatics: { base: 3 } } }
                }
            });
            const target = await factory.createActor({ type: 'character' });

            const items = await attacker.createEmbeddedDocuments('Item', [{ type: 'action', name: 'Test Action' }]);
            const item = items[0];

            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Targeted Effect',
                system: {
                    targets: [{ id: 't', applyTo: 'targeted_actor' }],
                    changes: [{ key: 'system.attributes.body', value: '@data.pool.value', type: 'add', target: 't' }],
                }
            }]);

            const test = (await TestCreator.fromItem(item, attacker, { showDialog: false, showMessage: false }))!;

            await test.evaluate();
            await test.effects.createTargetActorEffects(target);

            const appliedEffect = target.effects.find((effect) => effect.name === 'Targeted Effect') as SR5ActiveEffect | undefined;
            if (!appliedEffect) throw new Error('Expected copied targeted actor effect to exist on target actor.');

            assert.strictEqual(appliedEffect.system.appliedByTest, true);
            assert.strictEqual(appliedEffect.system.changes[0].value, test.pool.value);
            assert.strictEqual(target.system.attributes.body.value, test.pool.value);
        });

        it('TEST_ALL apply-to: Actor effect applies to test', async () => {
            const limitValue = 3;
            const poolValue = 3;
            const hitsValue = 3;

            const actor = await factory.createActor({ type: 'character' });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                origin: actor.uuid,
                name: 'Test Effect',
                system: {
                    targets: [{ id: 't', applyTo: 'test_all' }],
                    changes: [
                        // NOTE: test doesn't use system.
                        { key: 'data.limit', value: `${limitValue}`, type: 'add', target: 't' },
                        { key: 'data.pool', value: `${poolValue}`, type: 'add', target: 't' },
                        { key: 'data.values.hits', value: `${poolValue}`, type: 'add', target: 't' },
                    ]
                }
            }]);

            const action = DataDefaults.createData('action_roll', { test: 'SuccessTest' });

            const test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false });
            if (!test) throw new Error('Failed to create test from action.');

            await test.execute();

            assert.deepEqual(test.limit.changes, [createTestChange(effects[0], 0)]);
            assert.equal(test.limit.value, limitValue);
            // SuccessTest will always include global and wounds modifier by default.
            assert.deepEqual(test.pool.changes, [createTestChange(effects[0], 1)]);
            assert.equal(test.pool.value, poolValue);
            assert.deepEqual(test.hits.changes, [createTestChange(effects[0], 2)]);
            assert.isAtLeast(test.hits.value, hitsValue);
        });

        it('TEST_ALL apply-to: Item effect applies to test', async () => {
            const limitValue = 3;
            const poolValue = 3;
            const hitsValue = 3;

            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [{ type: 'action', name: 'Test Action' }]);

            const item = items.pop()!;

            const effects = await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: {
                    targets: [{ id: 't', applyTo: 'test_all' }],
                    changes: [
                        // NOTE: test doesn't use system.
                        { key: 'data.limit', value: `${limitValue}`, type: 'add', target: 't' },
                        { key: 'data.pool', value: `${poolValue}`, type: 'add', target: 't' },
                        { key: 'data.values.hits', value: `${poolValue}`, type: 'add', target: 't' },
                    ],
                }
            }]);

            const test = (await TestCreator.fromItem(item, actor, { showDialog: false, showMessage: false }))!;

            await test.execute();

            assert.deepEqual(test.limit.changes, [createTestChange(effects[0], 0)]);
            assert.equal(test.limit.value, limitValue);
            // SuccessTest will always include global and wounds modifier by default.
            assert.deepEqual(test.pool.changes, [createTestChange(effects[0], 1)]);
            assert.equal(test.pool.value, poolValue);
            assert.deepEqual(test.hits.changes, [createTestChange(effects[0], 2)]);
            assert.isAtLeast(test.hits.value, hitsValue);
        });

        it('INCOMING TEST apply-to: targeted actor effect modifies the incoming test only', async () => {
            const attacker = await factory.createActor({ type: 'character' });
            const target = await factory.createActor({ type: 'character' });
            const other = await factory.createActor({ type: 'character' });

            await target.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Incoming Target Effect',
                system: {
                    targets: [
                        {
                            id: 'incoming',
                            applyTo: 'test_target',
                            conditions: [{ type: 'categories', values: ['social'] }],
                        },
                        { id: 'actor', applyTo: 'actor' },
                    ],
                    changes: [
                        { key: 'data.pool', value: '2', type: 'add', target: 'incoming' },
                        { key: 'system.attributes.body', value: '4', type: 'add', target: 'actor' },
                    ],
                },
            }]);
            await other.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Untargeted Incoming Effect',
                system: {
                    targets: [{ id: 'incoming', applyTo: 'test_target' }],
                    changes: [{ key: 'data.pool', value: '9', type: 'add', target: 'incoming' }],
                },
            }]);

            const action = DataDefaults.createData('action_roll', {
                test: SkillTest.name,
                categories: ['social'],
            });
            const test = (await TestCreator.fromAction(
                action,
                attacker,
                { showDialog: false, showMessage: false },
            ))!;
            test.targets = [target];
            test.prepareTestCategories();
            test.effects.applyAllEffects();
            ModifiableValue.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 2);
            assert.include(test.pool.changes.map(change => change.name), 'Incoming Target Effect');
            assert.notInclude(test.pool.changes.map(change => change.name), 'Untargeted Incoming Effect');
            assert.strictEqual(target.system.attributes.body.value, 4, 'actor-targeted change still applies only to actor data');
        });

        it('INCOMING TEST apply-to: targeted actor item effects apply and resolve target-side dynamic values', async () => {
            const attacker = await factory.createActor({ type: 'character' });
            const target = await factory.createActor({ type: 'character' });
            const items = await target.createEmbeddedDocuments('Item', [{
                type: 'action',
                name: 'Target-side Source',
                system: { action: { mod: 4 } },
            }]);
            const item = items[0];

            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Target Item Incoming Effect',
                system: {
                    targets: [{ id: 'incoming', applyTo: 'test_target' }],
                    changes: [{ key: 'data.pool', value: '@system.action.mod', type: 'add', target: 'incoming' }],
                },
            }]);

            const action = DataDefaults.createData('action_roll', { test: SkillTest.name });
            const test = (await TestCreator.fromAction(
                action,
                attacker,
                { showDialog: false, showMessage: false },
            ))!;
            test.targets = [target];
            test.effects.applyAllEffects();
            ModifiableValue.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 4);
            assert.include(test.pool.changes.map(change => change.name), 'Target Item Incoming Effect');
        });

        it('INCOMING TEST apply-to: multiple target effects stack while duplicate actor targets apply once', async () => {
            const attacker = await factory.createActor({ type: 'character' });
            const targetA = await factory.createActor({ type: 'character' });
            const targetB = await factory.createActor({ type: 'character' });

            await targetA.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Incoming A',
                system: {
                    targets: [{ id: 'incoming', applyTo: 'test_target' }],
                    changes: [{ key: 'data.pool', value: '2', type: 'add', target: 'incoming' }],
                },
            }]);
            await targetB.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Incoming B',
                system: {
                    targets: [{ id: 'incoming', applyTo: 'test_target' }],
                    changes: [{ key: 'data.pool', value: '3', type: 'add', target: 'incoming' }],
                },
            }]);

            const action = DataDefaults.createData('action_roll', { test: SkillTest.name });
            const test = (await TestCreator.fromAction(
                action,
                attacker,
                { showDialog: false, showMessage: false },
            ))!;
            test.targets = [targetA, targetA, targetB];
            test.effects.applyAllEffects();
            ModifiableValue.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 5);
            assert.strictEqual(test.pool.changes.filter(change => change.name === 'Incoming A').length, 1);
            assert.strictEqual(test.pool.changes.filter(change => change.name === 'Incoming B').length, 1);
        });

        it('INCOMING TEST apply-to: targeted items do not contribute effects', async () => {
            const attacker = await factory.createActor({ type: 'character' });
            const target = await factory.createActor({ type: 'character' });
            const items = await target.createEmbeddedDocuments('Item', [{
                type: 'action',
                name: 'Item-only Target',
            }]);
            const item = items[0];

            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Ignored Item Target Effect',
                system: {
                    targets: [{ id: 'incoming', applyTo: 'test_target' }],
                    changes: [{ key: 'data.pool', value: '7', type: 'add', target: 'incoming' }],
                },
            }]);

            const action = DataDefaults.createData('action_roll', { test: SkillTest.name });
            const test = (await TestCreator.fromAction(
                action,
                attacker,
                { showDialog: false, showMessage: false },
            ))!;
            test.targets = [item];
            test.effects.applyAllEffects();
            ModifiableValue.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 0);
            assert.notInclude(test.pool.changes.map(change => change.name), 'Ignored Item Target Effect');
        });

        it('TEST_ITEM apply-to: Item effect applies only when on test item', async () => {
            const limitValue = 3;
            const poolValue = 3;
            const hitsValue = 3;

            const actor = await factory.createActor({ type: 'character' });

            // Create a effect on actor that should NOT apply.
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect Actor',
                system: {
                    targets: [{ id: 't', applyTo: 'test_item' }],
                    changes: [
                        { key: 'data.limit', value: `${limitValue}`, type: 'add', target: 't' },
                        { key: 'data.pool', value: `${poolValue}`, type: 'add', target: 't' },
                        { key: 'data.values.hits', value: `${poolValue}`, type: 'add', target: 't' },
                    ],
                }
            }]);

            // Create one item that will carry the correct effect and one carries the wrong effect.
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'action', name: 'Test Action' },
                { type: 'action', name: 'Test Action 2' },
            ]);

            const item = items.pop()!;

            // Create the correct effect on the correct item.
            const itemEffects = await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect Correct Item',
                system: {
                    targets: [{ id: 't', applyTo: 'test_item' }],
                    changes: [
                        { key: 'data.limit', value: `${limitValue}`, type: 'add', target: 't' },
                        { key: 'data.pool', value: `${poolValue}`, type: 'add', target: 't' },
                        { key: 'data.values.hits', value: `${poolValue}`, type: 'add', target: 't' },
                    ],
                }
            }]);

            const item2 = items.pop()!;

            // Create the wrong effect on the wrong item.
            await item2.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect Wrong Item',
                system: {
                    targets: [{ id: 't', applyTo: 'test_item' }],
                    changes: [
                        { key: 'data.limit', value: `${limitValue}`, type: 'add', target: 't' },
                        { key: 'data.pool', value: `${poolValue}`, type: 'add', target: 't' },
                        { key: 'data.values.hits', value: `${poolValue}`, type: 'add', target: 't' },
                    ],
                },
            }]);

            // Test is created using the correct item.
            const test = (await TestCreator.fromItem(item, actor, { showDialog: false, showMessage: false }))!;

            await test.execute();

            assert.deepEqual(test.limit.changes, [createTestChange(itemEffects[0], 0)]);
            assert.equal(test.limit.value, limitValue);
            // SuccessTest will always include global and wounds modifier by default.
            assert.deepEqual(test.pool.changes, [createTestChange(itemEffects[0], 1)]);
            assert.equal(test.pool.value, poolValue);
            assert.deepEqual(test.hits.changes, [createTestChange(itemEffects[0], 2)]);
            assert.isAtLeast(test.hits.value, hitsValue);
        });

        it('TEST_ALL apply-to: skip opposed tests without explicit test selection', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [{
                type: 'action',
                name: 'Opposed Action',
                system: {
                    action: {
                        test: 'SuccessTest',
                        type: 'simple',
                        attribute: 'body',
                        skill: 'automatics',
                        limit: { attribute: 'physical' },
                        opposed: {
                            type: 'custom',
                            test: 'OpposedTest',
                            attribute: 'reaction',
                            attribute2: 'intuition',
                            skill: '',
                            description: '',
                        }
                    }
                }
            }]);

            await actor.createEmbeddedDocuments('ActiveEffect', [
                {
                    name: 'Unrestricted Effect',
                    system: {
                        changes: [{ key: 'data.pool', value: '3', type: 'add', target: 't' }],
                        targets: [{ id: 't', applyTo: 'test_all' }],
                    },
                },
                {
                    name: 'Opposed Effect',
                    system: {
                        changes: [{ key: 'data.pool', value: '2', type: 'add', target: 't' }],
                        targets: [{ id: 't', applyTo: 'test_all', conditions: [{ type: 'tests', values: ['OpposedTest'] }] }],
                    },
                },
            ]);

            const activeTest = (await TestCreator.fromItem(items[0], actor, { showDialog: false, showMessage: false }))!;
            const opposedData = await OpposedTest._getOpposedActionTestData(activeTest.data, actor, '');
            if (!opposedData) throw new Error('Failed to create opposed test data.');

            const opposedTest = new OpposedTest(opposedData, { actor });
            opposedTest.effects.applyAllEffects();

            const opposedEffect = opposedTest.pool.changes.find((effect) => effect.name === 'Opposed Effect') as any;
            assert.isDefined(opposedEffect, 'Expected to find the opposed effect in the opposed test pool changes.');
            assert.equal(opposedEffect.name, 'Opposed Effect');
            assert.equal(opposedEffect.type, 'add');
            assert.equal(opposedEffect.value, 2);
            assert.equal(opposedEffect.priority, 20);
            assert.equal(opposedEffect.enabled, true);
            assert.equal(opposedEffect.invalidated, false);
        });

        it('TEST_ALL apply-to: keep empty filters active', async () => {
            const actor = await factory.createActor({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [
                {
                    name: 'Empty Include Effect',
                    system: {
                        targets: [{
                            id: 'include',
                            applyTo: 'test_all',
                            conditions: [{ type: 'categories', mode: 'include', values: [] }],
                        }],
                        changes: [{ key: 'data.pool', value: '2', type: 'add', target: 'include' }],
                    },
                },
                {
                    name: 'Empty Exclude Effect',
                    system: {
                        targets: [{
                            id: 'exclude',
                            applyTo: 'test_all',
                            conditions: [{ type: 'categories', mode: 'exclude', values: [] }],
                        }],
                        changes: [{ key: 'data.pool', value: '3', type: 'add', target: 'exclude' }],
                    },
                },
            ]);

            const action = DataDefaults.createData('action_roll', {
                test: SkillTest.name,
                categories: ['social'],
            });
            const test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false });
            if (!test) throw new Error('Failed to create test from action.');

            test.prepareTestCategories();
            test.effects.applyAllEffects();

            const effectNames = test.pool.changes.map(change => change.name);
            assert.notInclude(effectNames, 'Empty Include Effect');
            assert.include(effectNames, 'Empty Exclude Effect');
        });

        it('TEST_ALL apply-to: respect skill, attribute and limit selections', async () => {
            const actor = await createCharacterWithSkills(['Automatics', 'Clubs']);
            const skillName = actor.getSkill('automatics')?.name ?? 'automatics';

            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Selection Effect',
                system: {
                    targets: [{ id: 't', applyTo: 'test_all', conditions: [
                        { type: 'skills', values: [skillName] },
                        { type: 'attributes', values: ['body'] },
                        { type: 'limits', values: ['physical'] },
                    ] }],
                    changes: [{ key: 'data.pool', value: '3', type: 'add', target: 't' }],
                }
            }]);

            const assertPoolValue = async (actionData: ActionRollType, expected: number) => {
                const test = (await TestCreator.fromAction(actionData, actor, { showDialog: false, showMessage: false })) as SkillTest;
                if (!test) throw new Error('Failed to create skill test.');

                test.effects.applyAllEffects();
                ModifiableValue.calcTotal(test.pool, { min: 0 });

                assert.strictEqual(test.pool.value, expected);
            };

            await assertPoolValue(
                DataDefaults.createData('action_roll', {
                    test: SkillTest.name,
                    skill: 'automatics',
                    attribute: 'body',
                    limit: { attribute: 'physical' },
                }),
                2,
            ); // skill defaulting 3 -1 => 2

            await assertPoolValue(
                DataDefaults.createData('action_roll', {
                    test: SkillTest.name,
                    skill: 'clubs',
                    attribute: 'body',
                    limit: { attribute: 'physical' },
                }),
                0,
            );

            await assertPoolValue(
                DataDefaults.createData('action_roll', {
                    test: SkillTest.name,
                    skill: 'automatics',
                    attribute: 'logic',
                    limit: { attribute: 'physical' },
                }),
                0,
            );

            await assertPoolValue(
                DataDefaults.createData('action_roll', {
                    test: SkillTest.name,
                    skill: 'automatics',
                    attribute: 'body',
                    limit: { attribute: 'mental' },
                }),
                0,
            );
        });
    });

    describe('AdvancedEffects suppress application', () => {
        it('A disabled effect should not apply', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const effects = await actor.createEmbeddedDocuments('ActiveEffect', [{
                system: { changes: [{ key: 'system.attributes.body', value: '3', type: 'add' }] },
                name: 'Test Effect',
                disabled: true,
            }]);

            const effect = effects.pop()!;

            assert.isTrue(effect.disabled);
            assert.lengthOf(actor.effects.contents, 1);
            assert.lengthOf(actor.system.attributes.body.changes, 0);
        });

        it('A wireless only effect should not apply for a wireless item', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [
                { type: 'cyberware', name: 'Wired Item', system: { technology: { wireless: 'none' } } },
                { type: 'cyberware', name: 'Wireless Item', system: { technology: { wireless: 'online' } } },
            ]);

            let item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: {
                    onlyForWireless: true,
                    changes: [{ key: 'system.attributes.body', value: '3', type: 'add' }],
                }
            }]);

            item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: {
                    changes: [{ key: 'system.attributes.body', value: '3', type: 'add' }],
                    onlyForWireless: true,
                }
            }]);

            assert.lengthOf(actor.system.attributes.body.changes, 1);
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
                system: {
                    onlyForEquipped: true,
                    changes: [{ key: 'system.attributes.body', value: '3', type: 'add' }],
                }
            }]);

            item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: {
                    changes: [{ key: 'system.attributes.body', value: '3', type: 'add' }],
                    onlyForEquipped: true,
                },
            }]);

            assert.lengthOf(actor.system.attributes.body.changes, 1);
            assert.equal(actor.system.attributes.body.value, 3);
        });

        it('A wireless and equipped only effect should not apply for a wired and unequipped item', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [
                {
                    type: 'cyberware',
                    name: 'Wireless Equipped Item',
                    system: { technology: { equipped: true, wireless: 'online' } },
                },
                {
                    type: 'cyberware',
                    name: 'Wired Unequipped Item',
                    system: { technology: { equipped: false, wireless: 'offline' } },
                },
            ]);

            let item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: {
                    onlyForEquipped: true,
                    onlyForWireless: true,
                    changes: [{ key: 'system.attributes.body', value: '3', type: 'add' }],
                }
            }]);

            item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: {
                    onlyForEquipped: true,
                    onlyForWireless: false,
                    changes: [{ key: 'system.attributes.body', value: '3', type: 'add' }],
                }
            }]);

            assert.lengthOf(actor.system.attributes.body.changes, 1);
            assert.equal(actor.system.attributes.body.value, 3);
        });

        it('A wireless and equipped only effect should not apply if it the effect itself disabled', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [{
                type: 'cyberware',
                name: 'Wireless Equipped Item',
                system: { technology: { equipped: true, wireless: 'online' } },
            }]);

            const item = items.pop()!;
            await item.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                disabled: true,
                system: {
                    onlyForEquipped: true,
                    onlyForWireless: true,
                    changes: [{ key: 'system.attributes.body', value: '3', type: 'add' }],
                }
            }]);

            // The value will match the attribute min value (0) due to ValueField flow.
            assert.lengthOf(actor.system.attributes.body.changes, 0);
            assert.equal(actor.system.attributes.body.value, 0);
        });

        it('A extended test should not apply effects on extended rolls', async () => {
            /**
             * Sum all modifier values for the given name.
             *
             * @param name The modifier name
             * @returns the sum of all modifier values matching the name
             */
            const reduceModifiersByName = (name: string) => (acc: number, modifier: { name: string; value: number }) =>
                modifier.name === name ? acc + modifier.value : acc;

            const actor = await factory.createActor({ type: 'character' });
            let actions = await actor.createEmbeddedDocuments('Item', [{ name: 'Test Action', type: 'action' }]);
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: {
                    targets: [{ id: 't', applyTo: 'test_all', conditions: [{ type: 'tests', values: ['SuccessTest'] }] }],
                    changes: [{ key: 'data.pool', value: '2', type: 'add', target: 't' }],
                }
            }]);

            let test = (await TestCreator.fromItem(actions[0], actor, { showDialog: false, showMessage: false }))!;
            await test.execute();

            // The first roll should have the effect applied
            assert.equal(test.pool.changes.reduce(reduceModifiersByName('Test Effect'), 0), 2);

            // Trigger the extended roll...
            test = await test.executeAsExtended();
            // ... assure effects aren't re applied but taken from the first roll.
            assert.equal(test.pool.changes.reduce(reduceModifiersByName('Test Effect'), 0), 2);

            actions = await actor.createEmbeddedDocuments('Item', [
                { name: 'Test Action', type: 'action', system: { action: { extended: true } } },
            ]);
            test = (await TestCreator.fromItem(actions[0], actor, { showDialog: false, showMessage: false }))!;

            // This will trigger the first and all extended rolls...
            await test.execute();

            /// ... the test reference is for the first roll and should have the effect applied.
            assert.equal(test.pool.changes.reduce(reduceModifiersByName('Test Effect'), 0), 2);
        });
    });

    describe('AdvancedEffects with dynamic values', () => {
        it('ACTOR apply-to: Grab dynamic actor values', async () => {
            const actor = await factory.createActor({ type: 'character', system: { modifiers: { global: 6 } } });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Actor Effect',
                system: {
                    changes: [{ key: 'system.attributes.body', value: '@system.modifiers.global', type: 'add' }],
                },
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
                system: {
                    targets: [{ id: 't', applyTo: 'test_all' }],
                    changes: [{ key: 'data.damage', value: '3', type: 'add', target: 't' }],
                }
            }]);

            const test = (await TestCreator.fromItem(weapon, actor, { showDialog: false, showMessage: false }))!;

            await test.execute();
            ModifiableValue.calcTotal(test.data.damage);

            assert.equal(test.data.damage.value, 3);
        });

        it('TEST modify attribute and limit on SkillTest', async () => {
            const actor = await factory.createActor({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: {
                    targets: [{ id: 't', applyTo: 'test_all' }],
                    changes: [
                        { key: 'data.limit', value: '3', type: 'add', target: 't' },
                        { key: 'data.pool', value: '3', type: 'add', target: 't' },
                    ],
                }
            }]);

            const action = DataDefaults.createData('action_roll', {
                test: SkillTest.name,
                limit: { attribute: 'social' },
            });
            const test = (await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false })) as SkillTest;
            if (!test) throw new Error('Failed to create test from action.');

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
                system: {
                    targets: [{ id: 't', applyTo: 'test_all', conditions: [{ type: 'categories', values: ['social'] }] }],
                    changes: [{ key: 'data.pool', value: '3', type: 'add', target: 't' }],
                }
            }]);

            // CASE - Test uses the same category
            let action = DataDefaults.createData('action_roll', { test: 'SkillTest', categories: ['social'] });
            let test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false });
            if (!test) throw new Error('Failed to create test from action.');

            // Simulate relevant part of #execute
            test.prepareTestCategories();
            test.effects.applyAllEffects();

            ModifiableValue.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 3);

            // CASE - Test uses different category
            action = DataDefaults.createData('action_roll', { test: 'SkillTest', categories: ['matrix'] });
            test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false });
            if (!test) throw new Error('Failed to create test from action.');

            // Simulate relevant part of #execute
            test.prepareTestCategories();
            test.effects.applyAllEffects();

            ModifiableValue.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 0);

            // CASE - Test uses no category
            action = DataDefaults.createData('action_roll', { test: 'SkillTest', categories: [] });
            test = await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false });
            if (!test) throw new Error('Failed to create test from action.');

            // Simulate relevant part of #execute
            test.prepareTestCategories();
            test.effects.applyAllEffects();

            ModifiableValue.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 0);
        });

        it('Should apply skill-filtered modifiers for canonical keys and legacy skill names', async () => {
            const actor = await createCharacterWithSkills(['Sneaking']);
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Skill Effect',
                system: {
                    targets: [{ id: 't', applyTo: 'test_all', conditions: [{ type: 'skills', values: ['sneaking'] }] }],
                    changes: [{ key: 'data.pool', value: '2', type: 'add', target: 't' }],
                }
            }]);

            const action = DataDefaults.createData('action_roll', {
                test: SkillTest.name,
                skill: 'sneaking',
                attribute: 'agility',
            });
            const test = (await TestCreator.fromAction(action, actor, { showDialog: false, showMessage: false })) as SkillTest;
            if (!test) throw new Error('Failed to create test from action.');

            test.effects.applyAllEffects();
            ModifiableValue.calcTotal(test.pool);

            assert.strictEqual(test.pool.value, 1); // 2 - 1 (defaulted skill)
        });
    });

    /**
     * These tests cover interaction between Effect change application and data preparation code.
     */
    describe('AdvancedEffects should hold true to data preparation expectations', () => {
        it('Should apply armor element modifiers from effect changes and armor items correctly', async () => {
            const actor = await factory.createActor({ type: 'character' });
            await actor.createEmbeddedDocuments('ActiveEffect', [{
                name: 'Test Effect',
                system: {
                    changes: [
                        { key: 'system.armor.elements.fire', value: '3', type: 'add' },
                        { key: 'system.armor.elements.acid', value: '3', type: 'add' },
                        { key: 'system.armor.elements.cold', value: '3', type: 'add' },
                        { key: 'system.armor.elements.electricity', value: '3', type: 'add' },
                        { key: 'system.armor.elements.radiation', value: '3', type: 'add' },
                    ]
                }
            }]);
            await actor.createEmbeddedDocuments('Item', [{
                name: 'Test Armor',
                type: 'armor',
                system: {
                    technology: { equipped: true },
                    armor: {
                        elements: {
                            fire: { base: 1 },
                            acid: { base: 2 },
                            cold: { base: 3 },
                            electricity: { base: 4 },
                            radiation: { base: 5 },
                        },
                    }
                }
            }]);

            assert.strictEqual(actor.system.armor.elements.fire.value, 4);
            assert.strictEqual(actor.system.armor.elements.acid.value, 5);
            assert.strictEqual(actor.system.armor.elements.cold.value, 6);
            assert.strictEqual(actor.system.armor.elements.electricity.value, 7);
            assert.strictEqual(actor.system.armor.elements.radiation.value, 8);
        });
    });
};
