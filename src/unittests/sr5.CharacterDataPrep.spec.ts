import { SR5TestingDocuments } from "./utils";
import { SR5Actor } from "../module/actor/SR5Actor";
import { SR5Item } from "../module/item/SR5Item";
import { SR } from "../module/constants";
import CharacterActorData = Shadowrun.CharacterActorData;
import SpiritActorData = Shadowrun.SpiritActorData;
import SpriteActorData = Shadowrun.SpriteActorData;
import ICActorData = Shadowrun.ICActorData;
import VehicleActorData = Shadowrun.VehicleActorData;
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunSR5CharacterDataPrep = (context: QuenchBatchContext) => {
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

    describe('CharacterDataPrep', () => {
        it('default attribute values', async () => {
            const character = await testActor.create({ type: 'character', 'system.metatype': 'human' });

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
            const actor = await testActor.create({ type: 'character', 'system.metatype': 'human' });
            assert.strictEqual(actor.system.visibilityChecks.astral.hasAura, true);
            assert.strictEqual(actor.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(actor.system.visibilityChecks.meat.hasHeat, true);
            assert.strictEqual(actor.system.visibilityChecks.matrix.hasIcon, true);
            assert.strictEqual(actor.system.visibilityChecks.matrix.runningSilent, false);
        });

        it('monitor calculation', async () => {
            const actor = await testActor.create({ type: 'character' }) as SR5Actor;

            let character = actor.asCharacter() as CharacterActorData;

            // Check default values.
            assert.strictEqual(character.system.track.stun.max, 9); // 8 + round_up(1 / 2)
            assert.strictEqual(character.system.track.physical.max, 9); // 8 + round_up(1 / 2)
            assert.strictEqual(character.system.track.physical.overflow.max, SR.attributes.ranges.body.min); // body value

            // Check calculated values after update.
            await actor.update({
                'system.attributes.body.base': 6,
                'system.attributes.willpower.base': 6,
            });

            character = actor.asCharacter() as CharacterActorData;
            assert.strictEqual(character.system.track.stun.max, 11); // 8 + round_up(6 / 2)
            assert.strictEqual(character.system.track.physical.max, 11); // 8 + round_up(6 / 2)
            assert.strictEqual(character.system.track.physical.overflow.max, 6); // body value
        });

        it('Matrix condition monitor track calculation with modifiers', async () => {
            const actor = await testActor.create({ type: 'character', 'system.modifiers.matrix_track': 1 }) as SR5Actor;
            await actor.createEmbeddedDocuments('Item', [{
                'name': 'Commlink',
                'type': 'device',
                'system.category': 'commlink',
                'system.technology.equipped': true
            }]);

            const character = actor.asCharacter() as CharacterActorData;
            assert.equal(character.system.matrix.condition_monitor.max, 10); // 9 + 1
        });

        it('initiative calculation', async () => {
            const actor = await testActor.create({ type: 'character' }) as SR5Actor;

            const character = actor.asCharacter() as CharacterActorData;

            // Check default values.
            assert.strictEqual(character.system.initiative.meatspace.base.base, 2); // REA+INT
            assert.strictEqual(character.system.initiative.meatspace.dice.base, 1);
            assert.strictEqual(character.system.initiative.matrix.base.base, 1); // No matrix device
            assert.strictEqual(character.system.initiative.matrix.dice.base, 3); // Cold SIM
            assert.strictEqual(character.system.initiative.astral.base.base, 2); // INT+INT
            assert.strictEqual(character.system.initiative.astral.dice.base, 2);


            // Check calculated values.
            await actor.update({
                // Meatspace ini
                'system.attributes.reaction.base': 6,
                'system.attributes.intuition.base': 6, 
                'system.modifiers.meat_initiative': 2, 
                'system.modifiers.meat_initiative_dice': 1,

                // Astral ini
                'system.modifiers.astral_initiative': 2, 
                'system.modifiers.astral_initiative_dice': 1,

                // Matrix ini
                'system.modifiers.matrix_initiative': 2, 
                'system.modifiers.matrix_initiative_dice': 1,
            });

            // Matrix ini - Cold SIM
            await actor.createEmbeddedDocuments('Item', [{
                'name': 'Commlink',
                'type': 'device',
                'system.category': 'commlink',
                'system.technology.equipped': true,
                'system.atts.att3.value': 6,
            }]);

            assert.strictEqual(character.system.initiative.meatspace.base.value, 14); // REA+INT
            assert.strictEqual(character.system.initiative.meatspace.dice.value, 2);
            assert.strictEqual(character.system.initiative.matrix.base.value, 14); // No matrix device
            assert.strictEqual(character.system.initiative.matrix.dice.value, 4); // Cold SIM
            assert.strictEqual(character.system.initiative.astral.base.value, 14); // INT+INT
            assert.strictEqual(character.system.initiative.astral.dice.value, 3);

            // Matrix ini - Hot SIM
            await actor.update({
                'system.matrix.hot_sim': true
            });

            assert.strictEqual(character.system.initiative.matrix.dice.value, 5); // Cold SIM


            // Check for ini dice upper limits
            await actor.update({
                // Meatspace ini                
                'system.modifiers.meat_initiative_dice': 6,

                // Astral ini
                'system.modifiers.astral_initiative_dice': 6,

                // Matrix ini
                'system.modifiers.matrix_initiative_dice': 6,
            });

            assert.strictEqual(character.system.initiative.meatspace.dice.value, 5);
            assert.strictEqual(character.system.initiative.matrix.dice.value, 5);
            assert.strictEqual(character.system.initiative.astral.dice.value, 5);
        });

        it('limit calculation', async () => {
            const actor = await testActor.create({ type: 'character' }) as SR5Actor;

            let character = actor.asCharacter() as CharacterActorData;

            assert.strictEqual(character.system.limits.physical.value, 2); // (STR*2 + BOD + REA) / 3
            assert.strictEqual(character.system.limits.mental.value, 2);   // (LOG*2 + INT + WIL) / 3
            assert.strictEqual(character.system.limits.social.value, 3);   // (CHA*2 + WILL + ESS) / 3

            await actor.update({
                'system.attributes.strength.base': 6,
                'system.attributes.body.base': 6,
                'system.attributes.reaction.base': 6,
                'system.attributes.logic.base': 6,
                'system.attributes.intuition.base': 6,
                'system.attributes.willpower.base': 6,
                'system.attributes.charisma.base': 6,
                'system.attributes.essence.base': 6,
            });

            character = actor.asCharacter() as CharacterActorData;

            assert.strictEqual(character.system.limits.physical.value, 8);
            assert.strictEqual(character.system.limits.mental.value, 8);
            assert.strictEqual(character.system.limits.social.value, 8);
        });

        it('movement calculation', async () => {
            const actor = await testActor.create({ type: 'character' }) as SR5Actor;

            let character = actor.asCharacter() as CharacterActorData;

            assert.strictEqual(character.system.movement.walk.value, 2); // AGI * 2
            assert.strictEqual(character.system.movement.run.value, 4);  // AGI * 4

            await actor.update({
                'system.attributes.agility.base': 6
            });

            character = actor.asCharacter() as CharacterActorData;

            assert.strictEqual(character.system.movement.walk.value, 12);
            assert.strictEqual(character.system.movement.run.value, 24);
        });

        it('skill calculation', async () => {
            const actor = await testActor.create({
                type: 'character',
                'system.skills.active.arcana.base': 6,
                'system.skills.active.arcana.bonus': [{ key: 'Test', value: 1 }],
                'system.skills.active.arcana.specs': ['Test']
            }) as SR5Actor;

            const character = actor.asCharacter() as CharacterActorData;

            assert.strictEqual(character.system.skills.active.arcana.value, 7);
        });

        it('damage application to wounds', async () => {
            const actor = await testActor.create({ type: 'character' }) as SR5Actor;
            let character = actor.asCharacter() as CharacterActorData;

            assert.strictEqual(character.system.track.stun.value, 0);
            assert.strictEqual(character.system.track.stun.wounds, 0);
            assert.strictEqual(character.system.track.physical.value, 0);
            assert.strictEqual(character.system.track.physical.wounds, 0);

            assert.strictEqual(character.system.wounds.value, 0);

            await actor.update({
                'system.track.stun.value': 3,
                'system.track.physical.value': 3,
            });

            character = actor.asCharacter() as CharacterActorData;

            assert.strictEqual(character.system.track.stun.value, 3);
            assert.strictEqual(character.system.track.stun.wounds, 1);
            assert.strictEqual(character.system.track.physical.value, 3);
            assert.strictEqual(character.system.track.physical.wounds, 1);

            assert.strictEqual(character.system.wounds.value, 2);
        });

        it('damage application with low pain/wound tolerance', async () => {
            const actor = await testActor.create({
                type: 'character',
                'system.track.stun.value': 6,
                'system.track.physical.value': 6,
                'system.modifiers.wound_tolerance': -1
            }) as SR5Actor;

            const character = actor.asCharacter() as CharacterActorData;

            assert.strictEqual(character.system.track.stun.value, 6);
            assert.strictEqual(character.system.track.stun.wounds, 3); // would normally be 2
            assert.strictEqual(character.system.track.physical.value, 6);
            assert.strictEqual(character.system.track.physical.wounds, 3);
        });

        it('damage application with high pain tolerance / damage compensators', async () => {
            const actor = await testActor.create({
                type: 'character',
                'system.track.stun.value': 9,
                'system.track.physical.value': 9,
                'system.modifiers.pain_tolerance_stun': 3,
                'system.modifiers.pain_tolerance_physical': 6
            }) as SR5Actor;

            const character = actor.asCharacter() as CharacterActorData;

            assert.strictEqual(character.system.track.stun.value, 9);
            assert.strictEqual(character.system.track.stun.wounds, 2); // would normally be 3
            assert.strictEqual(character.system.track.physical.value, 9);
            assert.strictEqual(character.system.track.physical.wounds, 1); // would normally be 3
        });

        it('damage application with high AND low pain to lerance / damage compensators', async () => {
            const actor = await testActor.create({
                type: 'character',
                'system.track.stun.value': 9,
                'system.track.physical.value': 9,
                'system.modifiers.pain_tolerance_stun': 3,
                'system.modifiers.pain_tolerance_physical': 6,
                'system.modifiers.wound_tolerance': -1

            }) as SR5Actor;

            const character = actor.asCharacter() as CharacterActorData;

            /**
             * Wound tolerance should alter the amount of boxes of damage per wound
             * Pain tolerance should raise damage taken BEFORE wounds are derived from the remaining damage 
             */
            assert.strictEqual(character.system.track.stun.value, 9);
            assert.strictEqual(character.system.track.stun.wounds, 3);
            assert.strictEqual(character.system.track.physical.value, 9);
            assert.strictEqual(character.system.track.physical.wounds, 1);
        });
        it('Character recoil compensation', () => {
            let actor = new SR5Actor({ name: 'Testing', type: 'character', system: { attributes: { strength: { base: 5 } } } });
            let character = actor.asCharacter();
            if (!character) return assert.fail();

            assert.strictEqual(character.system.values.recoil_compensation.value, 3); // SR5#175: 5 / 3 = 1,6 (rounded up) = 2 => 2 + 1

            actor = new SR5Actor({ name: 'Testing', type: 'character', system: { attributes: { strength: { base: 1 } } } });
            character = actor.asCharacter();
            if (!character) return assert.fail();

            assert.strictEqual(character.system.values.recoil_compensation.value, 2); // SR5#175: 1 / 3 = 0,3 (rounded up) = 1 => 1 + 1
        });

        it('A NPC Grunt should only have physical track', async () => {
            const actor = await testActor.create({ type: 'character', 'system.is_npc': true, 'system.npc.is_grunt': true, 'system.attributes.willpower.base': 6}) as SR5Actor;
            const character = actor.asCharacter() as unknown as Shadowrun.CharacterActorData;
            
            assert.strictEqual(character.system.track.stun.value, 0);
            assert.strictEqual(character.system.track.stun.disabled, true);
            assert.strictEqual(character.system.track.physical.disabled, false);
        });
    });
}

