import { InventoryType } from 'src/module/types/actor/Common';
import { SR5Actor } from '../module/actor/SR5Actor';
import { SR5Item } from '../module/item/SR5Item';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const shadowrunInventoryFlow = (context: QuenchBatchContext) => {
    const { describe, it, should, before, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    before(async () => {});
    after(async () => {});

    describe('InventoryFlow testing', () => {
        it('create a new inventory and know of its existance', async () => {
            const actor = await SR5Actor.create({ name: 'QUENCH', type: 'character' }) as SR5Actor<'character'>;

            await actor.inventory.create('test');

            assert.exists(actor.system.inventories['test']);
            assert.deepEqual(actor.system.inventories['test'], {
                name: 'test',
                type: '',
                label: 'test',
                itemIds: [],
                showAll: true,
            });

            assert.strictEqual(actor.inventory.exists('test'), true);
            await actor.delete();
        });

        it('remove an inventory', async () => {
            const inventoriesData = { test: { name: 'test', label: 'test', itemIds: [] } };
            const actor = await SR5Actor.create({ name: 'QUENCH', type: 'character', system: { inventories: inventoriesData } }) as SR5Actor<'character'>;

            await actor.inventory.remove('test');

            assert.notExists(actor.system.inventories['test']);
            await actor.delete();
        });

        it('add and remove an item to and from an inventory', async () => {
            const inventoriesData = { test: { name: 'test', label: 'test', itemIds: [] } };
            const actor = await SR5Actor.create({ name: 'QUENCH', type: 'character', system: { inventories: inventoriesData } }) as SR5Actor<'character'>;
            const item = await actor.createEmbeddedDocuments('Item', [{ type: 'weapon', name: 'Test Weapon' }]) as SR5Item<'weapon'>[];

            await actor.inventory.addItems('test', item);
            const itemIds = item.map((item) => item.id);

            // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
            const inventories = actor.system.inventories as {[x: string]: InventoryType};
            assert.deepEqual(inventories.test.itemIds, itemIds);

            await actor.inventory.removeItem(item[0]);
            assert.deepEqual(inventories.test.itemIds, []);
            await actor.delete();
        });

        it('rename an existing inventory', async () => {
            const inventoriesData = { test: { name: 'test', label: 'test', itemIds: ['notAnItemId'] } };
            const actor = await SR5Actor.create({ name: 'QUENCH', type: 'character', system: { inventories: inventoriesData } }) as SR5Actor<'character'>;

            const before = 'test';
            const after = 'betterTest';
            await actor.inventory.rename(before, after);

            assert.notExists(actor.system.inventories[before]);
            assert.exists(actor.system.inventories[after]);
            assert.deepEqual(actor.system.inventories[after], {
                name: after,
                label: after,
                type: '',
                itemIds: ['notAnItemId'],
                showAll: true,
            });
            await actor.delete();
        });

        it('create and rename an inventory including prohibited foundry chars', async () => {
            const actor = await SR5Actor.create({ name: 'QUENCH', type: 'character' }) as SR5Actor<'character'>;

            await actor.inventory.create('Test.');

            assert.exists(actor.system.inventories['Test']);
            assert.notExists(actor.system.inventories['Test']['']);
            assert.deepEqual(actor.system.inventories['Test'], {
                name: 'Test',
                type: '',
                label: 'Test',
                itemIds: [],
                showAll: true,
            });

            await actor.inventory.rename('Test', 'Test.');
            assert.exists(actor.system.inventories['Test']);
            assert.notExists(actor.system.inventories['Test']['']);
            assert.deepEqual(actor.system.inventories['Test'], {
                name: 'Test',
                type: '',
                label: 'Test',
                itemIds: [],
                showAll: true,
            });

            await actor.inventory.remove('Test');
            assert.notExists(actor.system.inventories['Test']);
            await actor.inventory.create('-=Fisch.');
            assert.exists(actor.system.inventories['Fisch']);
            assert.deepEqual(actor.system.inventories['Fisch'], {
                name: 'Fisch',
                type: '',
                label: 'Fisch',
                itemIds: [],
                showAll: true,
            });

            await actor.delete();
        });
    });
};
