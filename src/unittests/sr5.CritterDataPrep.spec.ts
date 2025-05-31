import { SR5Item } from '../module/item/SR5Item';
import { SR5Actor } from './../module/actor/SR5Actor';
import { SR5TestingDocuments } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5CritterDataPrep = (context: QuenchBatchContext) => {
    const { describe, it, before, after } = context;
    const assert: Chai.AssertStatic = context.assert;

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
        it('Critter character recoil compensation', async () => {
            let critter = new SR5Actor<'critter'>({ name: 'Testing', type: 'critter', system: { attributes: { strength: { base: 5 } } } });
            if (!critter) return assert.fail();

            assert.strictEqual(critter.system.values.recoil_compensation.value, 3); // SR5#175: 5 / 3 = 1,6 (rounded up) = 2 => 2 + 1

            critter = new SR5Actor<'critter'>({ name: 'Testing', type: 'critter', system: { attributes: { strength: { base: 1 } } } });
            if (!critter) return assert.fail();

            assert.strictEqual(critter.system.values.recoil_compensation.value, 2); // SR5#175: 1 / 3 = 0,3 (rounded up) = 1 => 1 + 1

            await critter.delete();
        });

        it('visibility checks', async () => {
            const critter = new SR5Actor<'critter'>({ name: 'Testing', type: 'critter', system: { attributes: { strength: { base: 5 } } } });
            assert.strictEqual(critter.system.visibilityChecks.astral.hasAura, true);
            assert.strictEqual(critter.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(critter.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(critter.system.visibilityChecks.meat.hasHeat, true);
            assert.strictEqual(critter.system.visibilityChecks.matrix.hasIcon, false);
            assert.strictEqual(critter.system.visibilityChecks.matrix.runningSilent, false);
            await critter.delete();
        });
        it('A NPC Grunt should only have physical track', async () => {
            const critter = new SR5Actor<'critter'>({
                type: 'critter',
                system: {
                    is_npc: true,
                    npc: { is_grunt: true },
                    attributes: { willpower: { base: 6 } }
                }
            });

            assert.strictEqual(critter.system.track.stun.value, 0);
            assert.strictEqual(critter.system.track.stun.disabled, true);
            assert.strictEqual(critter.system.track.physical.disabled, false);

            await critter.delete();
        });
    });
};