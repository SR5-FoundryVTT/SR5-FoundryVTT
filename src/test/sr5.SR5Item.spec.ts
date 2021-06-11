import {SR5Item} from "../module/item/SR5Item";

export const shadowrunSR5Item = context => {
    /**
     * Setup handling for all items within this test.
     */
    class TestingItems {
        items: Record<string, SR5Item> = {};
        async create(data) {
            // @ts-ignore
            const item = await Item.create({name: '#QUENCH_TEST_ITEM_SHOULD_HAVE_BEEN_DELETED', ...data}) as SR5Item;
            this.items[item.id] = item;
            return item;
        }
        async delete(id) {
            const item = this.items[id];
            if (!item) return;
            await Item.delete(item.data._id);
            delete this.items[item.id];
        }

        async teardown() {
            Object.values(this.items).forEach(item => this.delete(item.id));
        }
    }


    const {describe, it, assert, before, after} = context;
    let testing;

    before(async () => {
        testing = new TestingItems();
    })

    after(async () => {
        await testing.teardown();
    })

    describe('SR5Items', () => {
        it('Should create a naked item of any type', async () => {
            const item = await testing.create({type: 'action'});

            // Check basic foundry data integrity
            assert.notStrictEqual(item.id, '');
            assert.notStrictEqual(item.id, undefined);
            assert.notStrictEqual(item.id, null);

            // Check foundry item collection integrity
            const itemFromCollection = game.items.get(item.id);
            assert.notStrictEqual(itemFromCollection, null);
            assert.strictEqual(item.id, itemFromCollection.id);
        });

        it('Should update an item of any type', async () => {
            const item = await testing.create({type: 'action'});

            assert.notProperty(item.data.data, 'test');
            await item.update({'data.test': true});

            assert.property(item.data.data, 'test');
            assert.propertyVal(item.data.data, 'test', true);
        });

        it('Should embedd an ammo into a weapon and not the global item collection', async () => {
            const weapon = await testing.create({type: 'weapon'});
            const ammo = await testing.create({type: 'ammo'});

            await weapon.createOwnedItem(ammo.data);

            const embeddedItemDatas = weapon.getEmbeddedItems();
            assert.isNotEmpty(embeddedItemDatas);
            assert.lengthOf(embeddedItemDatas, 1);

            const embeddedAmmoData = embeddedItemDatas[0];
            assert.strictEqual(embeddedAmmoData.type, ammo.data.type);

            // An embedded item should NOT appear in the items collection.
            const embeddedAmmoInCollection = game.items.get(embeddedAmmoData._id);
            assert.strictEqual(embeddedAmmoInCollection, null);
        });

        it('Should update an embedded ammo', async () => {
            const weapon = await testing.create({type: 'weapon'});
            const ammo = await testing.create({type: 'ammo'});

            // Embed the item and get
            await weapon.createOwnedItem(ammo.data);
            const embeddedItemDatas = weapon.getEmbeddedItems();
            assert.lengthOf(embeddedItemDatas, 1);
            const embeddedAmmoData = embeddedItemDatas[0];
            const embeddedAmmo = weapon.getOwnedItem(embeddedAmmoData._id);

            assert.notStrictEqual(embeddedAmmo, undefined);
            assert.instanceOf(embeddedAmmo, SR5Item);
            if (!embeddedAmmo) return; //type script gate...

            // Set an testing property.
            assert.notProperty(embeddedAmmo.data.data, 'test');
            await embeddedAmmo.update({'data.test': true});
            assert.property(embeddedAmmo.data.data, 'test');
            assert.propertyVal(embeddedAmmo.data.data, 'test', true);
        });
    });
};