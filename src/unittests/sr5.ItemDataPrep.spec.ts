import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5Item } from "../module/item/SR5Item";
import { SR5TestingDocuments } from "./utils";
import { TechnologyPrep } from "../module/item/prep/functions/TechnologyPrep";

/**
 * Tests involving data preparation for SR5Item types.
 */
export const shadowrunSR5ItemDataPrep = (context: QuenchBatchContext) => {
    const {describe, it, assert, before, after} = context;

    let testItem;

    before(async () => {
        testItem = new SR5TestingDocuments(SR5Item);
    })

    after(async () => {
        await testItem.teardown();
    });

    describe('TechnologyData preparation', () => {
        it('Calculate the correct device item condition monitor', () => {
            const device = foundry.utils.duplicate(game.model.Item.device) as Shadowrun.DeviceData;
            
            device.technology.rating = 4;
            TechnologyPrep.prepareConditionMonitor(device.technology);

            assert.equal(device.technology.condition_monitor.max, 10);
        });
        it('Calculate the correct device item condition monitor for rounded values', () => {
            const device = foundry.utils.duplicate(game.model.Item.device) as Shadowrun.DeviceData;
            
            device.technology.rating = 5;
            TechnologyPrep.prepareConditionMonitor(device.technology);

            assert.equal(device.technology.condition_monitor.max, 11);
        });
        it('Calculate a condition monitor for devices with malformed technology data', () => {
            const device = foundry.utils.duplicate(game.model.Item.device) as Shadowrun.DeviceData;
            
            device.technology.rating = 4;
            // @ts-expect-error // test-case makes this necessary
            device.technology.condition_monitor = undefined;
            TechnologyPrep.prepareConditionMonitor(device.technology);

            assert.equal(device.technology.condition_monitor.max, 10);
        });

        it('Calculate conceal data for a device', () => {
            const device = foundry.utils.duplicate(game.model.Item.device) as Shadowrun.DeviceData;
            const mods = [
                testItem.createItem({name: 'mod1', conceal: 2}),
                testItem.createItem({name: 'mod2', conceal: 4}),
                testItem.createItem({name: 'mod3', conceal: 3}),
                testItem.createItem({name: 'mod4', conceal: 1}),
            ];
            
            TechnologyPrep.prepareConceal(device.technology, mods);

            assert.equal(device.technology.conceal.value, 10);
            assert.equal(device.technology.conceal.mod.length, 4);
        });
    });
}