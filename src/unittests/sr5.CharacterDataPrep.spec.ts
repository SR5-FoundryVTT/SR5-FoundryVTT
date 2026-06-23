import { SR5TestFactory } from "./utils";
import { SR } from "../module/constants";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5Item } from "../module/item/SR5Item";

export const shadowrunSR5CharacterDataPrep = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    describe('CharacterDataPrep', () => {
        it('default attribute values', async () => {
            const character = await factory.createActor({ type: 'character', system: { metatype: 'human' } });

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
        });


        it('visibility checks', async () => {
            const character = await factory.createActor({ type: 'character', system: { metatype: 'human' } });
            assert.strictEqual(character.system.visibilityChecks.astral.hasAura, true);
            assert.strictEqual(character.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(character.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(character.system.visibilityChecks.meat.hasHeat, true);
            assert.strictEqual(character.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(character.system.visibilityChecks.matrix.runningSilent, false);
        });

        it('applies nested armor modifications to character armor value', async () => {
            const character = await factory.createActor({ type: 'character' });
            const armors = await character.createEmbeddedDocuments('Item', [{
                type: 'armor',
                name: 'Armor Jacket',
                system: {
                    armor: {
                        base: 6,
                        value: 6,
                        accessory: false,
                    },
                    technology: {
                        equipped: true,
                    }
                }
            }]);
            const armor = armors[0] as SR5Item<'armor'>;

            const modification = await factory.createItem({
                type: 'modification',
                name: 'Armor Mod',
                system: {
                    type: 'armor',
                    mod_armor: {
                        value: 2,
                    },
                    technology: {
                        equipped: true,
                    }
                }
            });
            await armor.createNestedItem(modification.toObject());

            assert.strictEqual(armor.system.armor.value, 8);
            assert.strictEqual(character.system.armor.rating.value, 8);
        });

        it('applies nested hardened armor modifications only to hardened actor armor', async () => {
            const character = await factory.createActor({ type: 'character' });
            const armors = await character.createEmbeddedDocuments('Item', [{
                type: 'armor',
                name: 'Armor Jacket',
                system: {
                    armor: {
                        base: 6,
                        is_hardened: true,
                        accessory: false,
                    },
                    technology: {
                        equipped: true,
                    }
                }
            }]);
            const armor = armors[0] as SR5Item<'armor'>;

            const normalModification = await factory.createItem({
                type: 'modification',
                name: 'Normal Armor Mod',
                system: {
                    type: 'armor',
                    mod_armor: {
                        value: 2,
                        is_hardened: false,
                    },
                    technology: {
                        equipped: true,
                    }
                }
            });

            const hardenedModification = await factory.createItem({
                type: 'modification',
                name: 'Hardened Armor Mod',
                system: {
                    type: 'armor',
                    mod_armor: {
                        value: 3,
                        is_hardened: true,
                    },
                    technology: {
                        equipped: true,
                    }
                }
            });

            await armor.createNestedItem(normalModification.toObject());
            await armor.createNestedItem(hardenedModification.toObject());

            assert.strictEqual(armor.system.armor.value, 2);
            assert.strictEqual(armor.system.armor.hardened, 9);
            assert.strictEqual(character.system.armor.rating.value, 2);
            assert.strictEqual(character.system.armor.hardened.value, 9);
        });

        it('uses armor base fields from non-armor equipped items when value fields are not prepared', async () => {
            const character = await factory.createActor({ type: 'character' });
            await character.createEmbeddedDocuments('Item', [{
                type: 'cyberware',
                name: 'Dermal Plating',
                system: {
                    armor: {
                        base: 2,
                        value: 0,
                        is_hardened: false,
                        hardened: 0,
                        accessory: true,
                        elements: {
                            acid: { base: 0, value: 0 },
                            cold: { base: 0, value: 0 },
                            electricity: { base: 0, value: 0 },
                            fire: { base: 3, value: 0 },
                            pollutant: { base: 0, value: 0 },
                            radiation: { base: 0, value: 0 },
                            water: { base: 0, value: 0 },
                        },
                        immunities: {
                            base: ['fire'],
                            value: [],
                        },
                    },
                    technology: {
                        equipped: true,
                    },
                }
            }]);

            assert.strictEqual(character.system.armor.rating.value, 2);
            assert.strictEqual(character.system.armor.elements.fire.value, 3);
            assert.strictEqual(character.system.armor.immunities.fire.value, 12);
        });

        it('monitor calculation', async () => {
            const character = await factory.createActor({
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
        });

        it('Matrix condition monitor track calculation with modifiers', async () => {
            const character = await factory.createActor({
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
        });

        it('initiative calculation', async () => {
            const character = await factory.createActor({
                type: 'character',
                system: {
                    attributes: {
                        reaction: {base: 1},
                        intuition: {base: 1}
                    }
                }
            });

            // Check default values.
            assert.strictEqual(character.system.initiative.meatspace.constant.value, 2); // REA+INT
            assert.strictEqual(character.system.initiative.meatspace.dice.value, 1);
            assert.strictEqual(character.system.initiative.matrix.constant.value, 1); // No matrix device
            assert.strictEqual(character.system.initiative.matrix.dice.value, 3); // Cold SIM
            assert.strictEqual(character.system.initiative.astral.constant.value, 2); // INT+INT
            assert.strictEqual(character.system.initiative.astral.dice.value, 2);

            // Check calculated values.
            await character.update({
                system: {
                    attributes: {
                        reaction: { base: 6 },
                        intuition: { base: 6 }
                    },
                    initiative: {
                        meatspace: { constant: { base: 2 }, dice: { base: 2 } },
                        astral: { constant: { base: 2 }, dice: { base: 3 } },
                        matrix: { constant: { base: 2 }, dice: { base: 4 } },
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

            assert.strictEqual(character.system.initiative.meatspace.constant.value, 14); // REA+INT
            assert.strictEqual(character.system.initiative.meatspace.dice.value, 2);
            assert.strictEqual(character.system.initiative.matrix.constant.value, 14); // No matrix device
            assert.strictEqual(character.system.initiative.matrix.dice.value, 4); // Cold SIM
            assert.strictEqual(character.system.initiative.astral.constant.value, 14); // INT+INT
            assert.strictEqual(character.system.initiative.astral.dice.value, 3);

            // Matrix ini - Hot SIM
            await character.update({ system: { matrix: { hot_sim: true } } });

            assert.strictEqual(character.system.initiative.matrix.dice.value, 5); // Cold SIM

            // Check for ini dice upper limits
            await character.update({
                system: {
                    initiative: {
                        meatspace: { dice: { base: 8 } },
                        astral: { dice: { base: 8 } },
                        matrix: { dice: { base: 8 } },
                    }
                }
            });

            assert.strictEqual(character.system.initiative.meatspace.dice.value, 5);
            assert.strictEqual(character.system.initiative.matrix.dice.value, 5);
            assert.strictEqual(character.system.initiative.astral.dice.value, 5);
        });

        it('custom initiative formulae apply to all modes and matrix hot-sim keeps +1d6', async () => {
            const character = await factory.createActor({
                type: 'character',
                system: {
                    attributes: {
                        reaction: { base: 5 },
                        intuition: { base: 4 },
                        logic: { base: 3 },
                        charisma: { base: 2 },
                    },
                    initiative: {
                        meatspace: { attribute_a: 'charisma', attribute_b: 'logic', constant: { base: 1 }, dice: { base: 4 } },
                        astral: { attribute_a: 'reaction', attribute_b: 'intuition', constant: { base: 2 }, dice: { base: 1 } },
                        matrix: { attribute_a: 'reaction', attribute_b: 'intuition', constant: { base: 0 }, dice: { base: 2 } },
                    },
                    matrix: {
                        hot_sim: true,
                    },
                }
            });

            assert.strictEqual(character.system.initiative.meatspace.constant.value, 6);
            assert.strictEqual(character.system.initiative.meatspace.dice.value, 4);
            assert.strictEqual(character.system.initiative.astral.constant.value, 11);
            assert.strictEqual(character.system.initiative.astral.dice.value, 1);
            assert.strictEqual(character.system.initiative.matrix.constant.value, 9);
            assert.strictEqual(character.system.initiative.matrix.dice.value, 3);
        });

        it('limit calculation', async () => {
            const character = await factory.createActor({
                type: 'character',
                system: {
                    attributes: {
                        reaction: {base: 1}, 
                        intuition: {base: 1}, 
                        strength: {base: 1}, 
                        body: {base: 1}, 
                        logic: {base: 1}, 
                        willpower: {base: 1}, 
                        charisma: {base: 1}, 
                        essence: {base: 1}
                    }
                }
            });

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
        });

        it('movement calculation', async () => {
            const character = await factory.createActor({
                type: 'character',
                system: {
                    attributes: {
                        agility: {base: 1}}
                    }
                }
            );

            assert.strictEqual(character.system.movement.walk.value, 2); // AGI * 2
            assert.strictEqual(character.system.movement.run.value, 4);  // AGI * 4

            await character.update({ system: { attributes: { agility: { base: 6 } } } });

            assert.strictEqual(character.system.movement.walk.value, 12);
            assert.strictEqual(character.system.movement.run.value, 24);
        });

        it('skill calculation', async () => {
            window.doNotPopulateDefaultSkills = true;

            const character = await factory.createActor({
                type: 'character'
            });

            // create a skill item to trigger SkillField preparation.
            await character.createEmbeddedDocuments('Item', [{
                type: 'skill',
                name: 'Test',
                system: {
                    type: 'skill',
                    skill: {
                        attribute: 'agility',
                        rating: 3
                    }
                },
            }]);

            delete window.doNotPopulateDefaultSkills;

            // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
            assert.strictEqual(character.system.skills.active.test.value, 3);
        });

        it('damage application to wounds', async () => {
            const character = await factory.createActor({ type: 'character' });

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
        });

        it('damage application with low pain/wound tolerance', async () => {
            const character = await factory.createActor({
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
        });

        it('damage application with high pain tolerance / damage compensators', async () => {
            const character = await factory.createActor({
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
        });

        it('damage application with high AND low pain to lerance / damage compensators', async () => {
            const character = await factory.createActor({
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
        });
        it('Character recoil compensation', async () => {
            const character = await factory.createActor({ type: 'character', system: { attributes: { strength: { base: 5 } } } });
            if (!character) return assert.fail();

            assert.strictEqual(character.system.values.recoil_compensation.value, 3); // SR5#175: 5 / 3 = 1,6 (rounded up) = 2 => 2 + 1

            await character.update({ system: { attributes: { strength: { base: 1 } } } });
            if (!character) return assert.fail();

            assert.strictEqual(character.system.values.recoil_compensation.value, 2); // SR5#175: 1 / 3 = 0,3 (rounded up) = 1 => 1 + 1
        });

        it('A NPC Grunt should only have physical track', async () => {
            const character = await factory.createActor({
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
        });
    });
};
