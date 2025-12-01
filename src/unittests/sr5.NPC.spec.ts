import { DataDefaults } from '@/module/data/DataDefaults';
import { SR5TestFactory } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunNPC = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { await factory.destroy(); });

    describe('NPC Character testing', () => {
        it('A NPC Grunt should only have physical track', async () => {
            const spirit = await factory.createActor({ type: 'character', system: { is_npc: true, npc: { is_grunt: true } } });

            assert.strictEqual(spirit.system.track.stun.value, 0);
            assert.strictEqual(spirit.system.track.stun.disabled, true);
            assert.strictEqual(spirit.system.track.physical.disabled, false);
        });
        
        it('A grunt npc should only take physical damage', async () => {
            // grunt NPCs only show a physical track and stun damage should transfer over to that.
            const systemData = { is_npc: true, npc: { is_grunt: true } };
            const actor = await factory.createActor({ type: 'character', system: systemData });
            
            assert.equal(actor.system.is_npc, true);
            assert.equal(actor.system.npc.is_grunt, true);
            assert.equal(actor.system.track.stun.value, 0);
            assert.equal(actor.system.track.physical.value, 0);

            const damage = DataDefaults.createData('damage', {type: { base: 'physical', value: 'physical' }, value: 3});
            await actor.addDamage(damage);

            assert.equal(actor.system.track.stun.value, 0);
            assert.equal(actor.system.track.physical.value, 3);
        });
    });
};