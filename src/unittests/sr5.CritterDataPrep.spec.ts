import { SR5Actor } from './../module/actor/SR5Actor';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunSR5CritterDataPrep = (context: QuenchBatchContext) => {
    const { describe, it, before, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    before(async () => {})
    after(async () => {})

    describe('CritterDataPrep', () => {
        it('Critter character recoil compensation', async () => {
            const critter = await SR5Actor.create({ name: 'Testing', type: 'critter', system: { attributes: { strength: { base: 5 } } } }) as SR5Actor<'critter'>;
            if (!critter) return assert.fail();

            assert.strictEqual(critter.system.values.recoil_compensation.value, 3); // SR5#175: 5 / 3 = 1,6 (rounded up) = 2 => 2 + 1

            await critter.update({ name: 'Testing', type: 'critter', system: { attributes: { strength: { base: 1 } } } });
            if (!critter) return assert.fail();

            assert.strictEqual(critter.system.values.recoil_compensation.value, 2); // SR5#175: 1 / 3 = 0,3 (rounded up) = 1 => 1 + 1

            await critter.delete();
        });

        it('visibility checks', async () => {
            const critter = await SR5Actor.create({ name: 'Testing', type: 'critter', system: { attributes: { strength: { base: 5 } } } }) as SR5Actor<'critter'>;
            assert.strictEqual(critter.system.visibilityChecks.astral.hasAura, true);
            assert.strictEqual(critter.system.visibilityChecks.astral.astralActive, false);
            assert.strictEqual(critter.system.visibilityChecks.astral.affectedBySpell, false);
            assert.strictEqual(critter.system.visibilityChecks.meat.hasHeat, true);
            assert.strictEqual(critter.system.visibilityChecks.matrix.hasIcon, false);
            assert.strictEqual(critter.system.visibilityChecks.matrix.runningSilent, false);
            await critter.delete();
        });
        it('A NPC Grunt should only have physical track', async () => {
            const critter = await SR5Actor.create({
                name: 'QUENCH',
                type: 'critter',
                system: {
                    is_npc: true,
                    npc: { is_grunt: true },
                    attributes: { willpower: { base: 6 } }
                }
            }) as SR5Actor<'critter'>;

            assert.strictEqual(critter.system.track.stun.value, 0);
            assert.strictEqual(critter.system.track.stun.disabled, true);
            assert.strictEqual(critter.system.track.physical.disabled, false);

            await critter.delete();
        });
    });
};