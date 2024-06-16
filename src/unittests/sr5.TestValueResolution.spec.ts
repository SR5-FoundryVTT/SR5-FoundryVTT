import { QuenchBatchContext } from '@ethaks/fvtt-quench';

/**
 * Tests handle value resolution based on test context and actor / device type.
 * 
 * 
 */
export const shadowrunTestValueResolution = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

    /**
     * Matrix related value resolutions based on owner, PAN, WAN, and direct connections.
     */
    describe('Matrix Tests', () => {
        it('Calculate matrix device without owner', () => {
            assert.fail();
        });

        it('Calculate matrix device with owner', () => {
            assert.fail();
        });
        it('Calculate matrix device inside a PAN', () => {
            assert.fail();
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