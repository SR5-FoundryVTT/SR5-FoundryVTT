import {SR5TestingDocuments} from "./utils";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";

export const shadowrunInventoryFlow = context => {
    const {describe, it, assert, should, before, after} = context;

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

    describe('InventoryFlow testing', () => {
        it('create a new inventory and know of its existance', async () => {
            const actor = await testActor.create({type: 'character'});

            await actor.inventory.create('test');

            assert.deepEqual(actor.data.data.inventories, {
                'test': {
                    name: 'test',
                    label: 'test',
                    itemIds: []
                }
            });

            assert.strictEqual(actor.inventory.exists('test'), true);
        });

        it('remove an inventory', async () => {
            const inventoriesData = {test: {name: 'test', label: 'test', itemIds: []}};
            const actor = await testActor.create({type: 'character', 'data.inventories': inventoriesData});

            await actor.inventory.remove('test');

            assert.deepEqual(actor.data.data.inventories, {});
        });

        it('add and remove an item to and from an inventory', async () => {
            const inventoriesData = {test: {name: 'test', label: 'test', itemIds: []}};
            const actor = await testActor.create({type: 'character', 'data.inventories': inventoriesData});
            const item = await actor.createEmbeddedDocuments('Item', [{type: 'weapon', name: 'Test Weapon'}]);

            await actor.inventory.addItems('test', item);
            const itemIds = item.map(item => item.id);
            assert.deepEqual(actor.data.data.inventories.test.itemIds, itemIds);

            await actor.inventory.removeItem(item[0]);
            assert.deepEqual(actor.data.data.inventories.test.itemIds, []);
        });

        it('rename an existing inventory', async () => {
            const inventoriesData = {test: {name: 'test', label: 'test', itemIds: ['asd']}};
            const actor = await testActor.create({type: 'character', 'data.inventories': inventoriesData});

            await actor.inventory.rename('test', 'betterTest');

            assert.deepEqual(actor.data.data.inventories, {
                'betterTest': {
                    name: 'betterTest',
                    label: 'betterTest',
                    itemIds: ['asd']
                }
            });
        });
    })
}