import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5Item } from '../module/item/SR5Item';
import { DataDefaults } from '../module/data/DataDefaults';
import { TestCreator } from '../module/tests/TestCreator';
import { SR5Actor } from '../module/actor/SR5Actor';
import { SR5TestingDocuments } from './utils';
import { BruteForceTest } from '../module/tests/BruteForceTest';

/**
 * Tests handle value resolution based on test context and actor / device type.
 * 
 * 
 */
export const shadowrunTestValueResolution = (context: QuenchBatchContext) => {
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

    /**
     * Helper method to setup a decker actor with a cyberdeck.
     */
    async function createDecker(deckerSystem = {}, deckSystem = {}): Promise<SR5Actor> {
        const actorSystem = {
            'attributes.willpower.base': 5,
            'attributes.logic.base': 5,
            ...deckerSystem
        };

        const itemSystem = {
            'technology.rating': 3,
            'category': 'cyberdeck',
            ...deckSystem
        };

        const decker = await testActor.create({ type: 'character', system: actorSystem });
        await decker.createEmbeddedDocuments('Item', [{ type: 'device', name: 'test', system: itemSystem }]);

        return decker;
    }

    /**
     * Matrix related value resolutions based on owner, PAN, WAN, and direct connections.
     */
    describe('Matrix Tests', () => {
        it('Calculate matrix device without owner', async () => {
            // @ts-expect-error // Lazy Typing
            const device = new SR5Item({ type: 'device', name: 'test', system: { 'technology.rating': 3 } });

            assert.equal(device.system.technology?.rating, 3);
            assert.equal(device.system.attributes?.willpower.value, 3);
            assert.equal(device.system.attributes?.firewall.value, 3);

            const action = DataDefaults.actionRollData({ attribute: 'willpower', attribute2: 'firewall' });
            const test = await TestCreator.fromAction(action, device);

            assert.equal(test?.pool.value, 6);
        });

        it('Calculate matrix device with owner', async () => {
            const owner = await testActor.create({ type: 'character', system: { 'attributes.willpower.base': 5 } });
            const devices = await owner.createEmbeddedDocuments('Item', [{ type: 'device', name: 'test', system: { 'technology.rating': 3 } }]);
            const device = devices[0];

            assert.equal(device.system.technology?.rating, 3);
            assert.equal(device.system.attributes?.willpower.value, 3);
            assert.equal(device.system.attributes?.firewall.value, 3);

            assert.equal(owner.system.attributes?.willpower.value, 5);

            const action = DataDefaults.actionRollData({ attribute: 'willpower', attribute2: 'firewall' });
            const test = await TestCreator.fromAction(action, device);

            assert.equal(test?.pool.value, 8);
        });
        it('Calculate matrix device inside a PAN', async () => {
            const master = await testItem.create({ type: 'device', system: { 'technology.rating': 5, 'category': 'commlink' } }) as SR5Item;
            const slave = await testItem.create({ type: 'equipment', system: { 'technology.rating': 3 } }) as SR5Item;

            assert.equal(master.system.technology?.rating, 5);
            assert.equal(slave.system.technology?.rating, 3);

            await master.addSlave(slave);

            const action = DataDefaults.actionRollData({ attribute: 'willpower', attribute2: 'firewall' });
            const test = await TestCreator.fromAction(action, slave);

            assert.equal(test?.pool.value, 8);
        });

        it('Calculate matrix device with an owner', async () => {
            const owner = await createDecker();
            const device = owner.items.contents[0];

            // Owner rating is used for mental attributes.
            const rollData = device.getRollData();
            assert.equal(rollData.attributes.willpower.value, 5);
        });

        it('Calculate matrix device inside a PAN with a direct connection', async () => {
            // TODO: Remake with only test mockup data.
            const decker = await createDecker({ 'skills.active.hacking.base': 5 });

            const action = DataDefaults.actionRollData({ attribute: 'logic', skill: 'hacking', test: 'BruteForceTest' });
            const test = await TestCreator.fromAction(action, decker) as BruteForceTest;

            const master = await testItem.create({ type: 'device', system: { 'technology.rating': 5, 'category': 'commlink' } }) as SR5Item;
            const slave = await testItem.create({ type: 'equipment', system: { 'technology.rating': 3 } }) as SR5Item;
            await master.addSlave(slave);

            // Assert initial wireless connection.
            test.data.directConnection = false;

            let rollData = slave.getRollData({ againstData: test.data });

            // Master rating is used for firewall.
            assert.equal(rollData.attributes.firewall.value, 5);

            // Assert direct connection.
            test.data.directConnection = true;

            rollData = slave.getRollData({ againstData: test.data });

            // Slave rating is used for firewall.
            assert.equal(rollData.attributes.firewall.value, 3);
        });

        it('Calculate matrix device inside a WAN without a direct connection', async () => {
            const host = await testItem.create({ type: 'device', system: { 'technology.rating': 5, 'category': 'host' } }) as SR5Item;
            const device = await testItem.create({ type: 'equipment', system: { 'technology.rating': 3, 'technology.master': host.uuid } }) as SR5Item;

            const rollData = device.getRollData();

            assert.equal(rollData.attributes.firewall.value, 5);
        });

        it('Calculate matrix device inside a WAN with a direct connection', async () => {
            const host = await testItem.create({ type: 'device', system: { 'technology.rating': 5, 'category': 'host' } }) as SR5Item;
            const device = await testItem.create({ type: 'equipment', system: { 'technology.rating': 3, 'technology.master': host.uuid } }) as SR5Item;

            const againstData = {directConnection: true};
            const rollData = device.getRollData({againstData});

            assert.equal(rollData.attributes.firewall.value, 3);
        });

        it('Calculate Decker in foundation');

        // describe('Matrix testing for value sources depending on network used', () => {
        //     it('A device within a PAN should use the masters / controllers values', async () => {
        //         const device = await testItem.create({ type: 'device', 'system.technology.rating': 20 });
        //         const controller = await testItem.create({ type: 'device', 'system.category': 'commlink', 'system.atts.att4.value': 5, 'system.technology.rating': 5 }) as SR5Item;

        //         await controller.addNetworkDevice(device);

        //         const action = DataDefaults.actionRollData({ attribute: 'willpower', attribute2: 'firewall' });
        //         const data = await TestCreator._prepareTestDataWithAction(action, device, TestCreator._minimalTestData())

        //         Helpers.calcTotal(data.pool);

        //         assert.equal(data.pool.value, 40);
        //     });

        //     it('A device within a WAN should NOT use the host values', async () => {
        //         assert.fail();
        //     });
        // });
    });

    /**
     * Rigging related value resolutions based on vehicle mode.
     */
    describe('Rigging Tests', () => {
        it('Calculate vehicle values for autopilot');
        it('Calculate vehicle values for rigged in');
        it('Calculate vehicle values for remote controlled');
    });


    /**
     * Magic related value resolution based on astral / physical.
     */
    describe('Astral Tests', () => {
        it('Calculate Magician in physical world');
        it('Calculate Magician in astral world');
    });
};