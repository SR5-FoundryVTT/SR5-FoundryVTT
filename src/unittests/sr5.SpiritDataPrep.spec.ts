import { SR5TestFactory } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5SpiritDataPrep = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    describe('SpiritDataPrep', () => {
        it('Spirits are always magical', async () => {
            const spirit = await factory.createActor({ type: 'spirit' });

            assert.strictEqual(spirit.system.special, 'magic');
        });

        it('visibility checks', async () => {
            const spirit = await factory.createActor({ type: 'spirit' });
            assert.strictEqual(spirit.system.visibilityChecks.astral.astralActive, true);
            assert.strictEqual(spirit.system.visibilityChecks.astral.hasAura, true);
            assert.strictEqual(spirit.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(spirit.system.visibilityChecks.meat.hasHeat, false);
            assert.strictEqual(spirit.system.visibilityChecks.matrix.hasIcon, false);
            assert.strictEqual(spirit.system.visibilityChecks.matrix.runningSilent, false);
        });


        it('applies force plus offsets and ignores spirit type mechanically', async () => {
            const baseSystem = {
                attributes: {
                    force: { base: 6 },
                    body: { base: 2 },
                    agility: { base: -1 },
                    reaction: { base: 0 },
                    strength: { base: 1 },
                    willpower: { base: 0 },
                    logic: { base: 1 },
                    intuition: { base: -1 },
                    charisma: { base: 2 },
                    magic: { base: 0 },
                    essence: { base: 0 }
                }
            };

            const airSpirit = await factory.createActor({ type: 'spirit', system: { ...baseSystem, spiritType: 'air' } });
            const fireSpirit = await factory.createActor({ type: 'spirit', system: { ...baseSystem, spiritType: 'fire' } });

            assert.strictEqual(airSpirit.system.attributes.body.value, 8);
            assert.strictEqual(airSpirit.system.attributes.agility.value, 5);
            assert.strictEqual(airSpirit.system.attributes.reaction.value, 6);
            assert.strictEqual(airSpirit.system.attributes.strength.value, 7);
            assert.strictEqual(airSpirit.system.attributes.logic.value, 7);
            assert.strictEqual(airSpirit.system.attributes.intuition.value, 5);
            assert.strictEqual(airSpirit.system.initiative.meatspace.constant.value, 11);

            assert.strictEqual(fireSpirit.system.attributes.body.value, airSpirit.system.attributes.body.value);
            assert.strictEqual(fireSpirit.system.attributes.agility.value, airSpirit.system.attributes.agility.value);
            assert.strictEqual(fireSpirit.system.attributes.reaction.value, airSpirit.system.attributes.reaction.value);
            assert.strictEqual(fireSpirit.system.attributes.strength.value, airSpirit.system.attributes.strength.value);
            assert.strictEqual(fireSpirit.system.attributes.logic.value, airSpirit.system.attributes.logic.value);
            assert.strictEqual(fireSpirit.system.attributes.intuition.value, airSpirit.system.attributes.intuition.value);
            assert.strictEqual(fireSpirit.system.initiative.meatspace.constant.value, airSpirit.system.initiative.meatspace.constant.value);
        });

        it('force applies only to enabled attributes', async () => {
            const spirit = await factory.createActor({
                type: 'spirit',
                system: {
                    attributes: {
                        force: { base: 6 },
                        body: { base: 3, applies_special: false },
                        agility: { base: 2, applies_special: false },
                        reaction: { base: 1, applies_special: false },
                        strength: { base: 4, applies_special: false },
                        willpower: { base: 1, applies_special: true }
                    }
                }
            });

            assert.strictEqual(spirit.system.attributes.body.value, 3);
            assert.strictEqual(spirit.system.attributes.agility.value, 2);
            assert.strictEqual(spirit.system.attributes.reaction.value, 1);
            assert.strictEqual(spirit.system.attributes.strength.value, 4);
            assert.strictEqual(spirit.system.attributes.willpower.value, 7);
        });

        it('default spirit initiative formula uses reaction + intuition (meatspace) and intuition + intuition (astral)', async () => {
            const spirit = await factory.createActor({
                type: 'spirit',
                system: {
                    attributes: {
                        force: { base: 5 },
                        reaction: { base: 2 },
                        intuition: { base: -1 }
                    }
                }
            });

            assert.strictEqual(spirit.system.attributes.reaction.value, 7);
            assert.strictEqual(spirit.system.attributes.intuition.value, 4);
            assert.strictEqual(spirit.system.initiative.meatspace.constant.value, 11);
            assert.strictEqual(spirit.system.initiative.astral.constant.value, 10);
            assert.strictEqual(spirit.system.initiative.meatspace.dice.value, 2);
            assert.strictEqual(spirit.system.initiative.astral.dice.value, 3);
        });

        it('custom spirit initiative formula supports force attributes, constants, and blank attribute slots', async () => {
            const spirit = await factory.createActor({
                type: 'spirit',
                system: {
                    attributes: {
                        force: { base: 6 },
                        reaction: { base: 1 },
                        intuition: { base: 1 }
                    },
                    initiative: {
                        meatspace: {
                            attribute_a: 'force',
                            attribute_b: '',
                            constant: { base: 3 },
                            dice: { base: 4 },
                        },
                        astral: {
                            attribute_a: '',
                            attribute_b: '',
                            constant: { base: 5 },
                            dice: { base: 1 },
                        }
                    }
                }
            });

            assert.strictEqual(spirit.system.initiative.meatspace.constant.value, 9);
            assert.strictEqual(spirit.system.initiative.astral.constant.value, 5);
            assert.strictEqual(spirit.system.initiative.meatspace.dice.value, 4);
            assert.strictEqual(spirit.system.initiative.astral.dice.value, 1);
        });

        it('spirit initiative dice total is capped at 5', async () => {
            const spirit = await factory.createActor({
                type: 'spirit',
                system: {
                    initiative: {
                        meatspace: { dice: { base: 7 } },
                        astral: { dice: { base: 6 } }
                    }
                }
            });

            assert.strictEqual(spirit.system.initiative.meatspace.dice.base, 7);
            assert.strictEqual(spirit.system.initiative.meatspace.dice.value, 5);
            assert.strictEqual(spirit.system.initiative.astral.dice.base, 6);
            assert.strictEqual(spirit.system.initiative.astral.dice.value, 5);
        });

        it('spirit skills are toggles where on equals force and off equals zero', async () => {
            window.doNotPopulateDefaultSkills = true;

            const spirit = await factory.createActor({
                type: 'spirit',
                system: {
                    attributes: {
                        force: { base: 6 },
                    }
                }
            });

            await spirit.createEmbeddedDocuments('Item', [
                {
                    type: 'skill',
                    name: 'Assensing',
                    system: {
                        type: 'skill',
                        skill: {
                            category: 'active',
                            attribute: 'intuition',
                            rating: 1
                        }
                    }
                },
                {
                    type: 'skill',
                    name: 'Perception',
                    system: {
                        type: 'skill',
                        skill: {
                            category: 'active',
                            attribute: 'intuition',
                            rating: 3
                        }
                    }
                },
                {
                    type: 'skill',
                    name: 'Arcana',
                    system: {
                        type: 'skill',
                        skill: {
                            category: 'active',
                            attribute: 'logic',
                            rating: 0
                        }
                    }
                },
            ]);

            delete window.doNotPopulateDefaultSkills;

            assert.strictEqual(spirit.system.skills.active.assensing.value, 6);
            assert.strictEqual(spirit.system.skills.active.perception.value, 6);
            assert.strictEqual(spirit.system.skills.active.arcana.value, 0);
        });

        it('spirit half value skill mode applies ceil(force/2) to ON skills', async () => {
            window.doNotPopulateDefaultSkills = true;

            const spirit = await factory.createActor({
                type: 'spirit',
                system: {
                    half_value_skill: true,
                    attributes: {
                        force: { base: 5 },
                    }
                }
            });

            await spirit.createEmbeddedDocuments('Item', [
                {
                    type: 'skill',
                    name: 'Assensing',
                    system: {
                        type: 'skill',
                        skill: {
                            category: 'active',
                            attribute: 'intuition',
                            rating: 1
                        }
                    }
                },
                {
                    type: 'skill',
                    name: 'Arcana',
                    system: {
                        type: 'skill',
                        skill: {
                            category: 'active',
                            attribute: 'logic',
                            rating: 0
                        }
                    }
                },
            ]);

            delete window.doNotPopulateDefaultSkills;

            assert.strictEqual(spirit.system.skills.active.assensing.value, 3);
            assert.strictEqual(spirit.system.skills.active.arcana.value, 0);
        });

        it('Spirit recoil compensation', async () => {
            const spirit = await factory.createActor({
                type: 'spirit',
                system: {
                    attributes: {
                        force: { base: 7 },
                        strength: { base: -2 }
                    }
                }
            });
            if (!spirit) return assert.fail();

            assert.strictEqual(spirit.system.values.recoil_compensation.value, 3); // SR5#175: (strength) 5 / 3 = 1,6 (rounded up) = 2 => 2 + 1
        });
    });
};
