import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { DataDefaults } from "../module/data/DataDefaults";
import { DamageTypeType } from "@/module/types/item/Action";
import { SR5Item } from "@/module/item/SR5Item";

export const shadowrunDamage = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    const createDamage = (type: DamageTypeType, value: number) => {
        return DataDefaults.createData('damage', {type: {base: type, value: type}, base: value, value});
    }

    describe('Meat Damage', () => {
        it('apply stun damage', async () => {
            const character = await factory.createActor({ type: 'character' });
            assert.equal(character.system.track.stun.value, 0);

            const damageData = createDamage('stun', 1);
            await character.addDamage(damageData);
            assert.equal(character.system.track.stun.value, 1);
        });
        it('apply stun damage with overflow', async () => {
            const character = await factory.createActor({ type: 'character' });
            assert.equal(character.system.track.stun.value, 0);
            assert.equal(character.system.track.physical.value, 0);

            // 9 stun monitor, 1 for every 2 physical overflow
            const damageData = createDamage('stun', 12);
            await character.addDamage(damageData);
            assert.equal(character.system.track.stun.value, 9);
            assert.equal(character.system.track.physical.value, 1);
        });
        it('apply physical damage', async () => {
            const character = await factory.createActor({ type: 'character' });
            assert.equal(character.system.track.stun.value, 0);

            const damageData = createDamage('physical', 1);
            await character.addDamage(damageData);
            assert.equal(character.system.track.physical.value, 1);
        });
        it('apply physical damage with overflow', async () => {
            const character = await factory.createActor({ type: 'character' });
            assert.equal(character.system.track.physical.value, 0);
            assert.equal(character.system.track.physical.overflow.value, 0);

            const damageData = createDamage('physical', 12);
            await character.addDamage(damageData);
            assert.equal(character.system.track.physical.value, 9);
            assert.equal(character.system.track.physical.overflow.value, 1);
        });
    });

    describe('Matrix Damage', () => {
        it('Should apply damage to device', async () => {
            const device = await factory.createItem({ type: 'device' });
            assert.equal(device.system.technology.condition_monitor.value, 0);

            const damageData = createDamage('matrix', 1);
            await device.addDamage(damageData);
            assert.equal(device.system.technology.condition_monitor.value, 1);
        });

        it('Should apply damage to active device and actor', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const items = await actor.createEmbeddedDocuments('Item', [{ type: 'device', name: 'Test', system: { technology: { equipped: true } } }]);
            const device = items[0] as SR5Item<'device'>;
            assert.equal(device.system.technology.condition_monitor.value, 0);

            const damageData = createDamage('matrix', 1);
            await actor.addDamage(damageData);
            assert.equal(device.system.technology.condition_monitor.value, 1);
            assert.equal(actor.system.matrix.condition_monitor.value, 1);
        });

        it('Should apply as stun damage to technomancers', async () => {
            const character = await factory.createActor({ type: 'character', system: { special: 'resonance' } });
            assert.equal(character.system.track.stun.value, 0);
            assert.equal(character.system.matrix.condition_monitor.value, 0);

            const damageData = createDamage('matrix', 1);
            await character.addDamage(damageData);
            assert.equal(character.system.track.stun.value, 1);
            assert.equal(character.system.matrix.condition_monitor.value, 0);
        });
    });

    describe('Damage on armor', () => {
        it('Should alter damage for hardened armor');
    });

    describe('Vehicle Damage', () => {
        it('Should alter damage for vehicle armor');
    });
};
