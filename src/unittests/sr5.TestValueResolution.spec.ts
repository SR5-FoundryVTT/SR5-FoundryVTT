import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5Item } from '../module/item/SR5Item';
import { DataDefaults } from '../module/data/DataDefaults';
import { TestCreator } from '../module/tests/TestCreator';
import { SR5Actor } from '../module/actor/SR5Actor';
import { SR5TestingDocuments } from './utils';

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
     * Matrix related value resolutions based on owner, PAN, WAN, and direct connections.
     */
    describe('Matrix Tests', () => {
        it('Calculate matrix device without owner', async () => {
            // @ts-expect-error
            const device = new SR5Item({type: 'device', name: 'test', system: {'technology.rating': 3}});

            assert.equal(device.system.technology?.rating, 3);
            assert.equal(device.system.attributes?.willpower.value, 3);
            assert.equal(device.system.attributes?.firewall.value, 3);

            const action = DataDefaults.actionRollData({ attribute: 'willpower', attribute2: 'firewall' });
            const test = await TestCreator.fromAction(action, device);

            assert.equal(test?.pool.value, 6);
        });

        it('Calculate matrix device with owner', async () => {
            const owner = await testActor.create({type: 'character', system: {'attributes.willpower.base': 5}});
            const devices = await owner.createEmbeddedDocuments('Item', [{type: 'device', name: 'test', system: {'technology.rating': 3}}]);
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
            const master = await testItem.create({type: 'device', system: {'technology.rating': 5, 'category': 'commlink'}}) as SR5Item;
            const slave = await testItem.create({type: 'equipment', system: {'technology.rating': 3}}) as SR5Item;

            assert.equal(master.system.technology?.rating, 5);
            assert.equal(slave.system.technology?.rating, 3);

            await master.addNetworkDevice(slave);

            const action = DataDefaults.actionRollData({ attribute: 'willpower', attribute2: 'firewall' });
            const test = await TestCreator.fromAction(action, slave);

            assert.equal(test?.pool.value, 8);
        });

        it('Calculate matrix device with owner and a direct connection', () => {
            assert.fail();
        });

        it('Calculate matrix device inside a PAN with a direct connection', () => {
            assert.fail();
        });

        it('Calculate matrix device inside a WAN', () => {
            assert.fail();
        });

        it('Calculate Decker in foundation', () => {
            assert.fail();
        });

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
        it('Calculate vehicle values for autopilot', () => {
            assert.fail();
        });

        it('Calculate vehicle values for rigged in', () => {
            assert.fail();
        });

        it('Calculate vehicle values for remote controlled', () => {
            assert.fail();
        });
    });


    /**
     * Magic related value resolution based on astral / physical.
     */
    describe('Astral Tests', () => {
        it('Calculate Magician in physical world', () => {
            assert.fail();
        });

        it('Calculate Magician in astral world', () => {
            assert.fail();
        });
    });
};