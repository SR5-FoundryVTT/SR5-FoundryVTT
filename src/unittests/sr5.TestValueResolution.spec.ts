import { DataDefaults } from "@/module/data/DataDefaults";
import { SR5Item } from "@/module/item/SR5Item";
import { BruteForceTest } from "@/module/tests/BruteForceTest";
import { TestCreator } from "@/module/tests/TestCreator";
import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunTestValueResolution = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    /**
     * Helper method to setup a decker actor with a cyberdeck.
     */
    async function createDecker(deckerSystem: Actor.CreateData['system'] = {}, deckSystem: Item.CreateData['system'] = {}) {
        const actorSystem = {
            attributes: {
                willpower: { base: 5 },
                logic: { base: 5 },
            },
            ...deckerSystem
        };

        const itemSystem = {
            technology: { rating: 3 },
            category: 'cyberdeck',
            ...deckSystem
        };

        const decker = await factory.createActor({ type: 'character', system: actorSystem });
        await decker.createEmbeddedDocuments('Item', [{ type: 'device', name: 'test', system: itemSystem }]);

        return decker;
    }

    /**
     * Matrix related value resolutions based on owner, PAN, WAN, and direct connections.
     */
    describe('Matrix Tests', () => {
        it('Calculate matrix device without owner', async () => {
            const device = await factory.createItem({ type: 'device', system: { technology: { rating: 3 } } });

            assert.equal(device.system.technology.rating, 3);
            assert.equal(device.system.attributes.willpower.value, 3);
            assert.equal(device.system.attributes.firewall.value, 3);

            const action = DataDefaults.createData('action_roll', { attribute: 'willpower', attribute2: 'firewall' });
            const test = await TestCreator.fromAction(action, device);

            assert.equal(test?.pool.value, 6);
        });

        it('Calculate matrix device with owner', async () => {
            const owner = await factory.createActor({ type: 'character', system: { attributes: { willpower: { base: 5 } } } });
            const devices = await owner.createEmbeddedDocuments('Item', [{ type: 'device', name: 'test', system: { technology: { rating: 3 } } }]);
            const device = devices[0] as SR5Item<'device'>;

            assert.equal(device.system.technology.rating, 3);
            assert.equal(device.system.attributes.willpower.value, 3);
            assert.equal(device.system.attributes.firewall.value, 3);

            assert.equal(owner.system.attributes.willpower.value, 5);

            const action = DataDefaults.createData('action_roll', { attribute: 'willpower', attribute2: 'firewall' });
            const test = await TestCreator.fromAction(action, device);

            assert.equal(test?.pool.value, 8);
        });
        it('Calculate matrix device inside a PAN', async () => {
            const master = await factory.createItem({ type: 'device', system: { technology: { rating: 5 }, category: 'commlink' } });
            const slave = await factory.createItem({ type: 'equipment', system: { technology: { rating: 3 } } });

            assert.equal(master.system.technology.rating, 5);
            assert.equal(slave.system.technology.rating, 3);

            await master.addSlave(slave);

            const action = DataDefaults.createData('action_roll', { attribute: 'willpower', attribute2: 'firewall' });
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
            const decker = await createDecker({ skills: { active: { hacking: { base: 5 } } } });

            const action = DataDefaults.createData('action_roll', { attribute: 'logic', skill: 'hacking', test: 'BruteForceTest' });
            const test = await TestCreator.fromAction(action, decker) as BruteForceTest;

            const master = await factory.createItem({ type: 'device', system: { technology: { rating: 5 }, category: 'commlink' } });
            const slave = await factory.createItem({ type: 'equipment', system: { technology: { rating: 3 } } });
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
            const host = await factory.createItem({ type: 'device', system: { category: 'host', technology: { rating: 5 } } });
            const device = await factory.createItem({ type: 'equipment', system: { technology: { rating: 3, master: host.uuid } } });
            const rollData = device.getRollData();

            assert.equal(rollData.attributes.firewall.value, 5);
        });

        it('Calculate matrix device inside a WAN with a direct connection', async () => {
            const host = await factory.createItem({ type: 'device', system: { category: 'host', technology: { rating: 5 } } });
            const device = await factory.createItem({ type: 'equipment', system: { technology: { rating: 3, master: host.uuid } } });

            const againstData = { directConnection: true };
            const rollData = device.getRollData({ againstData });

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
