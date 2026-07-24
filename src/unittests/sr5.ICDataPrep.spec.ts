import { SR5TestFactory } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5ActiveEffect } from '@/module/effect/SR5ActiveEffect';

export const shadowrunSR5ICDataPrep = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    describe('ICDataPrep', () => {
        it('Matrix condition monitor track calculation with modifiers', async () => {
            const ic = await factory.createActor({ type: 'ic' });
            assert.equal(ic.system.matrix.condition_monitor.max, 8);

            await ic.update({ system: { modifiers: { matrix_track: 1 } } });
            assert.equal(ic.system.matrix.condition_monitor.max, 9);
        });

        it('visibility checks', async () => {
            const ic = await factory.createActor({ type: 'ic' });
            assert.strictEqual(ic.system.visibilityChecks.astral.hasAura, false);
            assert.strictEqual(ic.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(ic.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(ic.system.visibilityChecks.meat.hasHeat, false);
            assert.strictEqual(ic.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(ic.system.visibilityChecks.matrix.runningSilent, false);
        });

        it('has meat attributes based on the host rating', async () => {
            const ic = await factory.createActor({ type: 'ic', system: { host: { rating: 5 } } });

            assert.strictEqual(ic.system.attributes.agility.value, 5);
            assert.strictEqual(ic.system.attributes.reaction.value, 5);
            assert.strictEqual(ic.system.attributes.body.value, 5);
            assert.strictEqual(ic.system.attributes.strength.value, 5);
            assert.strictEqual(ic.system.attributes.logic.value, 5);
            assert.strictEqual(ic.system.attributes.willpower.value, 5);
            assert.strictEqual(ic.system.attributes.charisma.value, 5);
            assert.strictEqual(ic.system.attributes.intuition.value, 5);
        });

        it('has rating attribute based on the host rating', async () => {
            const ic = await factory.createActor({ type: 'ic', system: { host: { rating: 5 } } });
            assert.strictEqual(ic.system.attributes.rating.value, 5);
        });

        it('derives matrix action skills from the host rating', async () => {
            const ic = await factory.createActor({ type: 'ic', system: { host: { rating: 5 } } });

            for (const skillId of ['computer', 'cybercombat', 'electronic_warfare', 'hacking', 'software']) {
                const skill = ic.getSkill(skillId);

                // The host-derived anchor is a BASE_PRIORITY change entry now, so assert the resolved value.
                assert.exists(skill, skillId);
                assert.strictEqual(skill?.value, 5, skillId);
            }
        });

        it('applies attributes and matrix effects before IC consumers and aliases', async () => {
            const ic = await factory.createActor({
                type: 'ic',
                system: { host: { rating: 5 }, matrix: { attack: { base: 1 } } },
            });
            const effects = await ic.createEmbeddedDocuments('ActiveEffect', [
                { name: 'Raise Body', system: { changes: [{ key: 'system.attributes.body', value: '1', type: 'add' }] } },
                { name: 'Raise Attack', system: { changes: [{ key: 'system.matrix.attack', value: '2', type: 'add' }] } },
            ]) as SR5ActiveEffect[];

            // createEmbeddedDocuments does not guarantee return order matches input order, so resolve by name.
            const bodyEffect = effects.find(e => e.name === 'Raise Body')!;
            const attackEffect = effects.find(e => e.name === 'Raise Attack')!;
            assert.strictEqual(bodyEffect.system.changes[0].phase, SR5ActiveEffect.ATTRIBUTES_PHASE);
            assert.strictEqual(attackEffect.system.changes[0].phase, SR5ActiveEffect.MATRIX_PHASE);
            assert.strictEqual(ic.system.attributes.body.value, 6);
            assert.strictEqual(ic.system.matrix.attack.value, 2);
            assert.strictEqual(foundry.utils.getProperty(ic.system, 'attributes.attack.value'), 2);
        });

        it('custom matrix initiative formula is honored for IC', async () => {
            const ic = await factory.createActor({
                type: 'ic',
                system: {
                    host: { rating: 5 },
                    initiative: {
                        matrix: {
                            attribute_a: 'rating',
                            attribute_b: '',
                            constant: { base: 1 },
                            dice: { base: 2 },
                        },
                    },
                },
            });

            assert.strictEqual(ic.system.initiative.matrix.constant.value, 6);
            assert.strictEqual(ic.system.initiative.matrix.dice.value, 2);
        });
    });
};
