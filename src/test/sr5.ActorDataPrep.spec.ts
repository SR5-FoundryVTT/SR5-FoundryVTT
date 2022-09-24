import {SR5TestingDocuments} from "./utils";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import {SR} from "../module/constants";
import CharacterActorData = Shadowrun.CharacterActorData;
import SpiritActorData = Shadowrun.SpiritActorData;
import SpriteActorData = Shadowrun.SpriteActorData;

export const shadowrunSR5ActorDataPrep = context => {
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

        describe('CharacterDataPrep', () => {
            it('Character default attribute values', async () => {
                const actor = await testActor.create({type: 'character', metatype: 'human'});

                // Check for attribute min values;
                console.log('Physical attributes');
                assert.strictEqual(actor.data.data.attributes.body.value, SR.attributes.ranges['body'].min);
                assert.strictEqual(actor.data.data.attributes.agility.value, SR.attributes.ranges['agility'].min);
                assert.strictEqual(actor.data.data.attributes.reaction.value, SR.attributes.ranges['reaction'].min);
                assert.strictEqual(actor.data.data.attributes.strength.value, SR.attributes.ranges['strength'].min);
                assert.strictEqual(actor.data.data.attributes.willpower.value, SR.attributes.ranges['willpower'].min);
                assert.strictEqual(actor.data.data.attributes.logic.value, SR.attributes.ranges['logic'].min);
                assert.strictEqual(actor.data.data.attributes.intuition.value, SR.attributes.ranges['intuition'].min);
                assert.strictEqual(actor.data.data.attributes.charisma.value, SR.attributes.ranges['charisma'].min);

                console.log('Comon special attributes');
                assert.strictEqual(actor.data.data.attributes.edge.value, SR.attributes.ranges['edge'].min);
                assert.strictEqual(actor.data.data.attributes.essence.value, SR.attributes.defaults['essence']);

                console.log('Special special attributes');
                assert.strictEqual(actor.data.data.attributes.resonance.value, SR.attributes.ranges['resonance'].min);
                assert.strictEqual(actor.data.data.attributes.magic.value, SR.attributes.ranges['magic'].min);
            });

            it('Character monitor calculation', async () => {
                const actor = await testActor.create({type: 'character'}) as SR5Actor;

                let data = actor.asCharacter() as CharacterActorData;

                // Check default values.
                assert.strictEqual(data.data.track.stun.max, 9); // 8 + round_up(1 / 2)
                assert.strictEqual(data.data.track.physical.max, 9); // 8 + round_up(1 / 2)
                assert.strictEqual(data.data.track.physical.overflow.max, SR.attributes.ranges.body.min); // body value

                // Check calculated values after update.
                await actor.update({
                    'data.attributes.body.base': 6,
                    'data.attributes.willpower.base': 6,
                });

                assert.strictEqual(data.data.track.stun.max, 11); // 8 + round_up(6 / 2)
                assert.strictEqual(data.data.track.physical.max, 11); // 8 + round_up(6 / 2)
                assert.strictEqual(data.data.track.physical.overflow.max, 6); // body value
            });

            it('Character initiative calculation', async () => {
                const actor = await testActor.create({type: 'character'}) as SR5Actor;

                const data = actor.asCharacter() as CharacterActorData;

                // Check default values.
                console.log('Meatspace Ini');
                assert.strictEqual(data.data.initiative.meatspace.base.base, 2); // REA+INT
                assert.strictEqual(data.data.initiative.meatspace.dice.base, 1);
                console.log('Matrix AR Ini');
                assert.strictEqual(data.data.initiative.matrix.base.base, 1); // No matrix device
                assert.strictEqual(data.data.initiative.matrix.dice.base, 3); // Cold SIM
                console.log('Magic Ini');
                assert.strictEqual(data.data.initiative.astral.base.base, 2); // INT+INT
                assert.strictEqual(data.data.initiative.astral.dice.base, 2);
            });

            it('Character limit calculation', async () => {
                const actor = await testActor.create({type: 'character'}) as SR5Actor;

                const data = actor.asCharacter() as CharacterActorData;

                assert.strictEqual(data.data.limits.physical.value, 2); // (STR*2 + BOD + REA) / 3
                assert.strictEqual(data.data.limits.mental.value, 2);   // (LOG*2 + INT + WIL) / 3
                assert.strictEqual(data.data.limits.social.value, 3);   // (CHA*2 + WILL + ESS) / 3

                await actor.update({
                    'data.attributes.strength.base': 6,
                    'data.attributes.body.base': 6,
                    'data.attributes.reaction.base': 6,
                    'data.attributes.logic.base': 6,
                    'data.attributes.intuition.base': 6,
                    'data.attributes.willpower.base': 6,
                    'data.attributes.charisma.base': 6,
                    'data.attributes.essence.base': 6,
                });

                assert.strictEqual(data.data.limits.physical.value, 8);
                assert.strictEqual(data.data.limits.mental.value, 8);
                assert.strictEqual(data.data.limits.social.value, 8);
            });

            it('Character movement calculation', async () => {
                const actor = await testActor.create({type: 'character'}) as SR5Actor;

                const data = actor.asCharacter() as CharacterActorData;

                assert.strictEqual(data.data.movement.walk.value, 2); // AGI * 2
                assert.strictEqual(data.data.movement.run.value, 4);  // AGI * 4

                await actor.update({
                    'data.attributes.agility.base': 6
                });

                assert.strictEqual(data.data.movement.walk.value, 12);
                assert.strictEqual(data.data.movement.run.value, 24);
            });

            it('Character skill calculation', async () => {
                const actor = await testActor.create({type: 'character'}) as SR5Actor;

                const data = actor.asCharacter() as CharacterActorData;

                await actor.update({
                    'data.skills.active.arcana.base': 6,
                    'data.skills.active.arcana.bonus': [{key: 'Test', value: 1}],
                    'data.skills.active.arcana.specs': ['Test']
                });

                assert.strictEqual(data.data.skills.active.arcana.value, 7);
            });

            it('Character damage application', async () => {
                const actor = await testActor.create({type: 'character'}) as SR5Actor;
                const data = actor.asCharacter() as CharacterActorData;

                assert.strictEqual(data.data.track.stun.value, 0);
                assert.strictEqual(data.data.track.stun.wounds, 0);
                assert.strictEqual(data.data.track.physical.value, 0);
                assert.strictEqual(data.data.track.physical.wounds, 0);

                assert.strictEqual(data.data.wounds.value, 0);

                await actor.update({
                    'data.track.stun.value': 3,
                    'data.track.physical.value': 3,
                });

                assert.strictEqual(data.data.track.stun.value, 3);
                assert.strictEqual(data.data.track.stun.wounds, 1);
                assert.strictEqual(data.data.track.physical.value, 3);
                assert.strictEqual(data.data.track.physical.wounds, 1);

                assert.strictEqual(data.data.wounds.value, 2);
            });

            it('Character damage application with high pain/wound tolerance', async () => {
                const actor = await testActor.create({type: 'character'}) as SR5Actor;
                const data = actor.asCharacter() as CharacterActorData;

                await actor.update({
                    'data.track.stun.value': 6,
                    'data.track.physical.value': 6,
                    'data.modifiers.wound_tolerance': 3
                });

                assert.strictEqual(data.data.track.stun.value, 6);
                assert.strictEqual(data.data.track.stun.wounds, 1); // would normally be 2 (-2)
                assert.strictEqual(data.data.track.physical.value, 6);
                assert.strictEqual(data.data.track.physical.wounds, 1);

                assert.strictEqual(data.data.wounds.value, 2); // would normally be 4 (-4)
            });
        });
        describe('SpiritDataPrep', () => {
            it('Spirits are always magical', async () => {
                const actor = await testActor.create({type: 'spirit'}) as SR5Actor;

                assert.strictEqual(actor.data.data.special, 'magic');
            });

            it('Spirit default/overrides by example type', async () => {
                const actor = await testActor.create({type: 'spirit', 'data.spiritType': 'air'}) as SR5Actor;
                const data = actor.asSpirit() as SpiritActorData;

                // Without adequate force there will be negative base values with minimum attribute values.
                assert.strictEqual(data.data.attributes.body.base, -2);
                assert.strictEqual(data.data.attributes.agility.base, 3);
                assert.strictEqual(data.data.attributes.reaction.base, 4);
                assert.strictEqual(data.data.attributes.strength.base, -3);
                assert.strictEqual(data.data.attributes.intuition.base, 0);

                assert.strictEqual(data.data.initiative.meatspace.base.base, 4); // force * 2 + override;

                assert.strictEqual(data.data.skills.active.assensing.base, 0);

                await actor.update({
                    'data.force': 6
                });

                assert.strictEqual(data.data.attributes.body.base, 4);
                assert.strictEqual(data.data.attributes.agility.base, 9);
                assert.strictEqual(data.data.attributes.reaction.base, 10);
                assert.strictEqual(data.data.attributes.strength.base, 3);
                assert.strictEqual(data.data.attributes.intuition.base, 6); // set by force without spirit type mods.

                assert.strictEqual(data.data.initiative.meatspace.base.base, 16);

                assert.strictEqual(data.data.skills.active.assensing.base, 6);
                assert.strictEqual(data.data.skills.active.arcana.base, 0); // not for this spirit type.
            });
        });
        describe('SpriteDataPrep', () => {
            it('Sprites are always awakened', async () => {
                const actor = await testActor.create({type: 'sprite'});
                assert.strictEqual(actor.data.data.special, 'resonance');
            });

            it('Sprites default/override values by example type', async () => {
                const actor = await testActor.create({type: 'sprite', 'data.spriteType': 'courier'}) as SR5Actor;
                const data = actor.asSprite() as SpriteActorData;

                assert.strictEqual(data.data.matrix.sleaze.base, 3);
                assert.strictEqual(data.data.matrix.data_processing.base, 1);
                assert.strictEqual(data.data.matrix.firewall.base, 2);
                assert.strictEqual(data.data.matrix.sleaze.base, 3);

                assert.strictEqual(data.data.initiative.matrix.base.base, 1);

                assert.strictEqual(data.data.skills.active.hacking.base, 0);

                await actor.update({
                    'data.level': 6
                });

                assert.strictEqual(data.data.level, 6);

                assert.strictEqual(data.data.matrix.sleaze.base, 9);
                assert.strictEqual(data.data.matrix.data_processing.base, 7);
                assert.strictEqual(data.data.matrix.firewall.base, 8);
                assert.strictEqual(data.data.matrix.sleaze.base, 9);

                assert.strictEqual(data.data.initiative.matrix.base.base, 13);
                assert.strictEqual(data.data.initiative.matrix.dice.base, 4);

                assert.strictEqual(data.data.skills.active.hacking.base, 6);
                assert.strictEqual(data.data.skills.active.computer.base, 6); // all sprites
                assert.strictEqual(data.data.skills.active.electronic_warfare.base, 0); // not set by sprite type.
            })
        });
}