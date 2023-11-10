import { SR5Item } from '../module/item/SR5Item';
import { SR5Actor } from './../module/actor/SR5Actor';
import { SR5TestingDocuments } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5CritterDataPrep = (context: QuenchBatchContext) => {
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

    describe('CritterDataPrep', () => {
        it('Critter character recoil compensation', () => {
            let actor = new SR5Actor({ name: 'Testing', type: 'critter', system: { attributes: { strength: { base: 5 } } } });
            let critter = actor.asCritter();
            if (!critter) return assert.fail();

            assert.strictEqual(critter.system.values.recoil_compensation.value, 3); // SR5#175: 5 / 3 = 1,6 (rounded up) = 2 => 2 + 1

            actor = new SR5Actor({ name: 'Testing', type: 'critter', system: { attributes: { strength: { base: 1 } } } });
            critter = actor.asCritter();
            if (!critter) return assert.fail();

            assert.strictEqual(critter.system.values.recoil_compensation.value, 2); // SR5#175: 1 / 3 = 0,3 (rounded up) = 1 => 1 + 1
        });

        it('visibility checks', async () => {
            let actor = new SR5Actor({ name: 'Testing', type: 'critter', system: { attributes: { strength: { base: 5 } } } });
            assert.strictEqual(actor.system.visibilityChecks.astral.hasAura, true);
            assert.strictEqual(actor.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(actor.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(actor.system.visibilityChecks.meat.hasHeat, true);
            assert.strictEqual(actor.system.visibilityChecks.matrix.hasIcon, false);
            assert.strictEqual(actor.system.visibilityChecks.matrix.runningSilent, false);
        });
        it('A NPC Grunt should only have physical track', async () => {
            const actor = await testActor.create({ type: 'critter', 'system.is_npc': true, 'system.npc.is_grunt': true, 'system.attributes.willpower.base': 6}) as SR5Actor;
            const character = actor.asCritter() as unknown as Shadowrun.CharacterActorData;
            
            assert.strictEqual(character.system.track.stun.value, 0);
            assert.strictEqual(character.system.track.stun.disabled, true);
            assert.strictEqual(character.system.track.physical.disabled, false);
        });
    });
};