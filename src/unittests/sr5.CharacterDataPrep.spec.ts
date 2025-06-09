import { SkillFieldType } from "src/module/types/template/SkillsModel";
import { SR5Actor } from "../module/actor/SR5Actor";
import { SR } from "../module/constants";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunSR5CharacterDataPrep = (context: QuenchBatchContext) => {
    const { describe, it, before, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    before(async () => {})

    after(async () => {})

    describe('CharacterDataPrep', () => {
        it('default attribute values', async () => {
            const character = new SR5Actor<'character'>({ type: 'character', system: { metatype: 'human' } });

            // Check for attribute min values;
            console.log('Physical attributes');
            assert.strictEqual(character.system.attributes.body.value, SR.attributes.ranges['body'].min);
            assert.strictEqual(character.system.attributes.agility.value, SR.attributes.ranges['agility'].min);
            assert.strictEqual(character.system.attributes.reaction.value, SR.attributes.ranges['reaction'].min);
            assert.strictEqual(character.system.attributes.strength.value, SR.attributes.ranges['strength'].min);
            assert.strictEqual(character.system.attributes.willpower.value, SR.attributes.ranges['willpower'].min);
            assert.strictEqual(character.system.attributes.logic.value, SR.attributes.ranges['logic'].min);
            assert.strictEqual(character.system.attributes.intuition.value, SR.attributes.ranges['intuition'].min);
            assert.strictEqual(character.system.attributes.charisma.value, SR.attributes.ranges['charisma'].min);

            console.log('Common special attributes');
            assert.strictEqual(character.system.attributes.edge.value, SR.attributes.ranges['edge'].min);
            assert.strictEqual(character.system.attributes.essence.value, SR.attributes.defaults['essence']);

            console.log('Special special attributes');
            assert.strictEqual(character.system.attributes.resonance.value, SR.attributes.ranges['resonance'].min);
            assert.strictEqual(character.system.attributes.magic.value, SR.attributes.ranges['magic'].min);

            await character.delete();
        });


        it('visibility checks', async () => {
            const character = new SR5Actor<'character'>({ type: 'character', system: { metatype: 'human' } });
            assert.strictEqual(character.system.visibilityChecks.astral.hasAura, true);
            assert.strictEqual(character.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(character.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(character.system.visibilityChecks.meat.hasHeat, true);
            assert.strictEqual(character.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(character.system.visibilityChecks.matrix.runningSilent, false);

            await character.delete();
        });

        it('monitor calculation', async () => {
            const character = new SR5Actor<'character'>({
                type: 'character',
                system: {
                    attributes: {
                        willpower: {base: 1},
                        body: {base: 1}
                    }
                }
            });

            // Check default values.
            assert.strictEqual(character.system.track.stun.max, 9); // 8 + round_up(1 / 2)
            assert.strictEqual(character.system.track.physical.max, 9); // 8 + round_up(1 / 2)
            assert.strictEqual(character.system.track.physical.overflow.max, 1); // body value

            // Check calculated values after update.
            await character.update({
                system: {
                    attributes: {
                        body: { base: 6 },
                        willpower: { base: 6 }
                    }
                }
            });

            assert.strictEqual(character.system.track.stun.max, 11); // 8 + round_up(6 / 2)
            assert.strictEqual(character.system.track.physical.max, 11); // 8 + round_up(6 / 2)
            assert.strictEqual(character.system.track.physical.overflow.max, 6); // body value

            await character.delete();
        });

        it('Matrix condition monitor track calculation with modifiers', async () => {
            const character = new SR5Actor<'character'>({
                type: 'character',
                system: {modifiers: { matrix_track: 1 } }
            });

            await character.createEmbeddedDocuments('Item', [{
                name: 'Commlink',
                type: 'device',
                system: {
                    category: 'commlink',
                    technology: { equipped: true }
                }
            }]);

            assert.equal(character.system.matrix.condition_monitor.max, 10); // 9 + 1

            await character.delete();
        });

        it('initiative calculation', async () => {
            const character = new SR5Actor<'character'>({
                type: 'character',
                system: {
                    attributes: {
                        reaction: {base: 1},
                        intuition: {base: 1}
                    }
                }
            });

            // Check default values.
            assert.strictEqual(character.system.initiative.meatspace.base.base, 2); // REA+INT
            assert.strictEqual(character.system.initiative.meatspace.dice.base, 1);
            assert.strictEqual(character.system.initiative.matrix.base.base, 1); // No matrix device
            assert.strictEqual(character.system.initiative.matrix.dice.base, 3); // Cold SIM
            assert.strictEqual(character.system.initiative.astral.base.base, 2); // INT+INT
            assert.strictEqual(character.system.initiative.astral.dice.base, 2);


            // Check calculated values.
            await character.update({
                system: {
                    attributes: {
                        reaction: { base: 6 },
                        intuition: { base: 6 }
                    },
                    modifiers: {
                        meat_initiative: 2,
                        meat_initiative_dice: 1,
                        astral_initiative: 2,
                        astral_initiative_dice: 1,
                        matrix_initiative: 2,
                        matrix_initiative_dice: 1
                    }
                }
            });

            // Matrix ini - Cold SIM
            await character.createEmbeddedDocuments('Item', [{
                name: 'Commlink',
                type: 'device',
                system: {
                    category: 'commlink',
                    technology: { equipped: true },
                    atts: { att3: { value: 6 } }
                }
            }]);

            assert.strictEqual(character.system.initiative.meatspace.base.value, 14); // REA+INT
            assert.strictEqual(character.system.initiative.meatspace.dice.value, 2);
            assert.strictEqual(character.system.initiative.matrix.base.value, 14); // No matrix device
            assert.strictEqual(character.system.initiative.matrix.dice.value, 4); // Cold SIM
            assert.strictEqual(character.system.initiative.astral.base.value, 14); // INT+INT
            assert.strictEqual(character.system.initiative.astral.dice.value, 3);

            // Matrix ini - Hot SIM
            await character.update({ system: { matrix: { hot_sim: true } } });

            assert.strictEqual(character.system.initiative.matrix.dice.value, 5); // Cold SIM


            // Check for ini dice upper limits
            await character.update({
                system: {
                    modifiers: {
                        meat_initiative_dice: 6,
                        astral_initiative_dice: 6,
                        matrix_initiative_dice: 6
                    }
                }
            });

            assert.strictEqual(character.system.initiative.meatspace.dice.value, 5);
            assert.strictEqual(character.system.initiative.matrix.dice.value, 5);
            assert.strictEqual(character.system.initiative.astral.dice.value, 5);

            await character.delete();
        });

        it('limit calculation', async () => {
            const character = new SR5Actor<'character'>({ type: 'character', system: {
                attributes: {
                    reaction: {base: 1}, 
                    intuition: {base: 1}, 
                    strength: {base: 1}, 
                    body: {base: 1}, 
                    logic: {base: 1}, 
                    willpower: {base: 1}, 
                    charisma: {base: 1}, 
                    essence: {base: 1}}}
                }
            );

            assert.strictEqual(character.system.limits.physical.value, 2); // (STR*2 + BOD + REA) / 3
            assert.strictEqual(character.system.limits.mental.value, 2);   // (LOG*2 + INT + WIL) / 3
            assert.strictEqual(character.system.limits.social.value, 3);   // (CHA*2 + WILL + ESS) / 3

            await character.update({
                system: {
                    attributes: {
                        strength: { base: 6 },
                        body: { base: 6 },
                        reaction: { base: 6 },
                        logic: { base: 6 },
                        intuition: { base: 6 },
                        willpower: { base: 6 },
                        charisma: { base: 6 },
                        essence: { base: 6 },
                    }
                }
            });

            assert.strictEqual(character.system.limits.physical.value, 8);
            assert.strictEqual(character.system.limits.mental.value, 8);
            assert.strictEqual(character.system.limits.social.value, 8);

            await character.delete();
        });

        it('movement calculation', async () => {
            const character = new SR5Actor<'character'>({ type: 'character', system: {
                attributes: {
                    agility: {base: 1}}}
                }
            );

            assert.strictEqual(character.system.movement.walk.value, 2); // AGI * 2
            assert.strictEqual(character.system.movement.run.value, 4);  // AGI * 4

            await character.update({ system: { attributes: { agility: { base: 6 } } } });

            assert.strictEqual(character.system.movement.walk.value, 12);
            assert.strictEqual(character.system.movement.run.value, 24);

            await character.delete();
        });

        it('skill calculation', async () => {
            const character = new SR5Actor<'character'>({
                type: 'character',
                system: {
                    skills: {
                        active: {
                            arcana: {
                                base: 6,
                                bonus: [{ key: 'Test', value: "1" }],
                                specs: ['Test']
                            }
                        }
                    }
                }
            });

            // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
            const active = character.system.skills.active as {[x: string]: SkillFieldType};
            assert.strictEqual(active.arcana.value, 7);

            await character.delete();
        });

        it('damage application to wounds', async () => {
            const character = new SR5Actor<'character'>({ type: 'character' });

            assert.strictEqual(character.system.track.stun.value, 0);
            assert.strictEqual(character.system.track.stun.wounds, 0);
            assert.strictEqual(character.system.track.physical.value, 0);
            assert.strictEqual(character.system.track.physical.wounds, 0);

            assert.strictEqual(character.system.wounds.value, 0);

            await character.update({
                system: {
                    track: {
                        stun: { value: 3 },
                        physical: { value: 3 }
                    }
                }
            });

            assert.strictEqual(character.system.track.stun.value, 3);
            assert.strictEqual(character.system.track.stun.wounds, 1);
            assert.strictEqual(character.system.track.physical.value, 3);
            assert.strictEqual(character.system.track.physical.wounds, 1);

            assert.strictEqual(character.system.wounds.value, 2);

            await character.delete();
        });

        it('damage application with low pain/wound tolerance', async () => {
            const character = new SR5Actor<'character'>({
                type: 'character',
                system: {
                    track: {
                        stun: { value: 6 },
                        physical: { value: 6 }
                    },
                    modifiers: {
                        wound_tolerance: -1
                    }
                }
            });

            assert.strictEqual(character.system.track.stun.value, 6);
            assert.strictEqual(character.system.track.stun.wounds, 3); // would normally be 2
            assert.strictEqual(character.system.track.physical.value, 6);
            assert.strictEqual(character.system.track.physical.wounds, 3);

            await character.delete();
        });

        it('damage application with high pain tolerance / damage compensators', async () => {
            const character = new SR5Actor<'character'>({
                type: 'character',
                system: {
                    track: {
                        stun: { value: 9 },
                        physical: { value: 9 }
                    },
                    modifiers: {
                        pain_tolerance_stun: 3,
                        pain_tolerance_physical: 6
                    }
                }
            });

            assert.strictEqual(character.system.track.stun.value, 9);
            assert.strictEqual(character.system.track.stun.wounds, 2); // would normally be 3
            assert.strictEqual(character.system.track.physical.value, 9);
            assert.strictEqual(character.system.track.physical.wounds, 1); // would normally be 3

            await character.delete();
        });

        it('damage application with high AND low pain to lerance / damage compensators', async () => {
            const character = new SR5Actor<'character'>({
                type: 'character',
                system: {
                    track: {
                        stun: { value: 9 },
                        physical: { value: 9 }
                    },
                    modifiers: {
                        pain_tolerance_stun: 3,
                        pain_tolerance_physical: 6,
                        wound_tolerance: -1
                    }
                }
            });

            /**
             * Wound tolerance should alter the amount of boxes of damage per wound
             * Pain tolerance should raise damage taken BEFORE wounds are derived from the remaining damage 
             */
            assert.strictEqual(character.system.track.stun.value, 9);
            assert.strictEqual(character.system.track.stun.wounds, 3);
            assert.strictEqual(character.system.track.physical.value, 9);
            assert.strictEqual(character.system.track.physical.wounds, 1);

            await character.delete();
        });
        it('Character recoil compensation', async () => {
            let character = new SR5Actor<'character'>({ name: 'Testing', type: 'character', system: { attributes: { strength: { base: 5 } } } });
            if (!character) return assert.fail();

            assert.strictEqual(character.system.values.recoil_compensation.value, 3); // SR5#175: 5 / 3 = 1,6 (rounded up) = 2 => 2 + 1

            character = new SR5Actor<'character'>({ name: 'Testing', type: 'character', system: { attributes: { strength: { base: 1 } } } });
            if (!character) return assert.fail();

            assert.strictEqual(character.system.values.recoil_compensation.value, 2); // SR5#175: 1 / 3 = 0,3 (rounded up) = 1 => 1 + 1

            await character.delete();
        });

        it('A NPC Grunt should only have physical track', async () => {
            const character = new SR5Actor<'character'>({
                type: 'character',
                system: {
                    is_npc: true,
                    npc: { is_grunt: true },
                    attributes: { willpower: { base: 6 } }
                }
            });
            
            assert.strictEqual(character.system.track.stun.value, 0);
            assert.strictEqual(character.system.track.stun.disabled, true);
            assert.strictEqual(character.system.track.physical.disabled, false);

            await character.delete();
        });
    });
};
