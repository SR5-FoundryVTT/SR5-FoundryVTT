import { SR5TestFactory } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5SpriteDataPrep = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    describe('SpriteDataPrep', () => {
        it('Sprites are always resonant', async () => {
            const sprite = await factory.createActor({ type: 'sprite' });
            assert.strictEqual(sprite.system.special, 'resonance');
        });

        it('visibility checks', async () => {
            const sprite = await factory.createActor({ type: 'sprite' });
            assert.strictEqual(sprite.system.visibilityChecks.astral.hasAura, false);
            assert.strictEqual(sprite.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(sprite.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(sprite.system.visibilityChecks.meat.hasHeat, false);
            assert.strictEqual(sprite.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(sprite.system.visibilityChecks.matrix.runningSilent, false);
        });

        it('sprite type is metadata only and does not change prepared values', async () => {
            const baseSystem = {
                attributes: { level: { base: 6 }, resonance: { base: 2 } },
                matrix: {
                    attack: { base: 1 },
                    sleaze: { base: 2 },
                    data_processing: { base: -1 },
                    firewall: { base: 0 },
                }
            };

            const courier = await factory.createActor({ type: 'sprite', system: { ...baseSystem, spriteType: 'courier' } });
            const fault = await factory.createActor({ type: 'sprite', system: { ...baseSystem, spriteType: 'fault' } });

            assert.strictEqual(courier.system.attributes.resonance.value, 8);
            assert.strictEqual(courier.system.matrix.attack.value, 7);
            assert.strictEqual(courier.system.matrix.sleaze.value, 8);
            assert.strictEqual(courier.system.matrix.data_processing.value, 5);
            assert.strictEqual(courier.system.matrix.firewall.value, 6);
            assert.strictEqual(courier.system.initiative.matrix.base.base, 12);

            assert.strictEqual(fault.system.attributes.resonance.value, courier.system.attributes.resonance.value);
            assert.strictEqual(fault.system.matrix.attack.value, courier.system.matrix.attack.value);
            assert.strictEqual(fault.system.matrix.sleaze.value, courier.system.matrix.sleaze.value);
            assert.strictEqual(fault.system.matrix.data_processing.value, courier.system.matrix.data_processing.value);
            assert.strictEqual(fault.system.matrix.firewall.value, courier.system.matrix.firewall.value);
            assert.strictEqual(fault.system.initiative.matrix.base.base, courier.system.initiative.matrix.base.base);
        });

        it('level applies toggles control resonance and matrix attribute level contribution', async () => {
            const sprite = await factory.createActor({
                type: 'sprite',
                system: {
                    attributes: { level: { base: 6 }, resonance: { base: 2 } },
                    matrix: {
                        attack: { base: 1 },
                        sleaze: { base: 3 },
                        data_processing: { base: -1 },
                        firewall: { base: 0 },
                    },
                    level_applies: {
                        resonance: true,
                        attack: false,
                        sleaze: true,
                        data_processing: true,
                        firewall: false,
                    },
                    modifiers: {
                        matrix_initiative: 2,
                        matrix_initiative_dice: 1,
                    }
                }
            });

            assert.strictEqual(sprite.system.attributes.resonance.value, 8);
            assert.strictEqual(sprite.system.matrix.attack.value, 1);
            assert.strictEqual(sprite.system.matrix.sleaze.value, 9);
            assert.strictEqual(sprite.system.matrix.data_processing.value, 5);
            assert.strictEqual(sprite.system.matrix.firewall.value, 0);
            assert.strictEqual(sprite.system.matrix.rating, 6);

            assert.strictEqual(sprite.system.initiative.matrix.base.base, 12);
            assert.strictEqual(sprite.system.initiative.matrix.base.value, 14);
            assert.strictEqual(sprite.system.initiative.matrix.dice.base, 4);
            assert.strictEqual(sprite.system.initiative.matrix.dice.value, 5);
        });

        it('sprite skill toggles apply to active, language, and knowledge skills', async () => {
            window.doNotPopulateDefaultSkills = true;

            const sprite = await factory.createActor({
                type: 'sprite',
                system: {
                    attributes: { level: { base: 7 } },
                }
            });

            await sprite.createEmbeddedDocuments('Item', [
                {
                    type: 'skill',
                    name: 'Computer',
                    system: {
                        type: 'skill',
                        skill: { category: 'active', attribute: 'logic', rating: 1 }
                    }
                },
                {
                    type: 'skill',
                    name: 'Hacking',
                    system: {
                        type: 'skill',
                        skill: { category: 'active', attribute: 'logic', rating: 0 }
                    }
                },
                {
                    type: 'skill',
                    name: 'Sperethiel',
                    system: {
                        type: 'skill',
                        skill: { category: 'language', rating: 1 }
                    }
                },
                {
                    type: 'skill',
                    name: 'Matrix Hosts',
                    system: {
                        type: 'skill',
                        skill: { category: 'knowledge', knowledgeType: 'academic', attribute: 'logic', rating: 1 }
                    }
                },
            ]);

            delete window.doNotPopulateDefaultSkills;

            const languageSkill = Object.values(sprite.system.skills.language).find(skill => skill.name === 'Sperethiel');
            const knowledgeSkill = Object.values(sprite.system.skills.knowledge.academic).find(skill => skill.name === 'Matrix Hosts');

            assert.strictEqual(sprite.system.skills.active.computer.value, 7);
            assert.strictEqual(sprite.system.skills.active.hacking.value, 0);
            assert.strictEqual(languageSkill?.value, 7);
            assert.strictEqual(knowledgeSkill?.value, 7);
        });

        it('Matrix condition monitor track calculation with modifiers', async () => {
            const sprite = await factory.createActor({ type: 'sprite' });
            assert.equal(sprite.system.matrix.condition_monitor.max, 9);

            await sprite.update({ system: { modifiers: { matrix_track: 1 } } });
            assert.equal(sprite.system.matrix.condition_monitor.max, 10);
        });
    });
};
