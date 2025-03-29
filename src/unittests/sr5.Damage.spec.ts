import { SR5Actor } from './../module/actor/SR5Actor';
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5TestingDocuments } from './utils';
import { SR5Item } from '../module/item/SR5Item';
import { DataDefaults } from '../module/data/DataDefaults';

export const shadowrunDamage = (context: QuenchBatchContext) => {
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
    });

    const createDamage = (type: Shadowrun.DamageType, value: number) => {
        return DataDefaults.damageData({type: {base: type, value: type}, base: value, value});
    }

    describe('Meat Damage', () => {
        it('apply stun damage', async () => {
            const actor = await testActor.create({type: 'character'}) as SR5Actor;
            const character = actor.asCharacter();
            assert.equal(character?.system.track.stun.value, 0);

            const damageData = createDamage('stun', 1);
            await actor.addDamage(damageData);
            assert.equal(character?.system.track.stun.value, 1);
        });
        it('apply stun damage with overflow', async () => {
            const actor = await testActor.create({type: 'character'}) as SR5Actor;
            const character = actor.asCharacter();
            assert.equal(character?.system.track.stun.value, 0);
            assert.equal(character?.system.track.physical.value, 0);

            // 9 stun monitor, 1 for every 2 physical overflow
            const damageData = createDamage('stun', 12);
            await actor.addDamage(damageData);
            assert.equal(character?.system.track.stun.value, 9);
            assert.equal(character?.system.track.physical.value, 1);
        });
        it('apply physical damage', async () => {
            const actor = await testActor.create({type: 'character'}) as SR5Actor;
            const character = actor.asCharacter();
            assert.equal(character?.system.track.stun.value, 0);

            const damageData = createDamage('physical', 1);
            await actor.addDamage(damageData);
            assert.equal(character?.system.track.physical.value, 1);
        });
        it('apply physical damage with overflow', async () => {
            const actor = await testActor.create({type: 'character'}) as SR5Actor;
            const character = actor.asCharacter();
            assert.equal(character?.system.track.physical.value, 0);
            assert.equal(character?.system.track.physical.overflow.value, 0);

            const damageData = createDamage('physical', 12);
            await actor.addDamage(damageData);
            assert.equal(character?.system.track.physical.value, 9);
            assert.equal(character?.system.track.physical.overflow.value, 1);
        });
    });

    describe('Matrix Damage', () => {
        it('Should apply damage to device', async () => {
            const item = await testItem.create({type: 'device'}) as SR5Item;
            const device = item.asDevice;
            assert.equal(device?.system.technology.condition_monitor.value, 0);

            const damageData = createDamage('matrix', 1);
            await item.addDamage(damageData);
            assert.equal(device?.system.technology.condition_monitor.value, 1);
        });

        it('Should apply damage to active device and actor', async () => {
            const actor = await testActor.create({type: 'character'}) as SR5Actor;
            const items = await actor.createEmbeddedDocuments('Item', [{type: 'device', name: 'Test', 'system.technology.equipped': true}]) as SR5Item[];
            const device = items[0].asDevice;
            assert.equal(device?.system.technology.condition_monitor.value, 0);

            const damageData = createDamage('matrix', 1);
            await actor.addDamage(damageData);
            assert.equal(device?.system.technology.condition_monitor.value, 1);
            assert.equal(actor.asCharacter()?.system.matrix.condition_monitor.value, 1);
        });

        it('Should apply as stun damage to technomancers', async () => {
            const actor = await testActor.create({type: 'character', 'system.special': 'resonance'}) as SR5Actor;
            const character = actor.asCharacter();
            assert.equal(character?.system.track.stun.value, 0);
            assert.equal(character?.system.matrix.condition_monitor.value, 0);

            const damageData = createDamage('matrix', 1);
            await actor.addDamage(damageData);
            assert.equal(character?.system.track.stun.value, 1);
            assert.equal(character?.system.matrix.condition_monitor.value, 0);
        });
    });

    describe('Damage on armor', () => {
        it('Should alter damage for hardened armor');
    });

    describe('Vehicle Damage', () => {
        it('Should alter damage for vehicle armor');
    });
};
