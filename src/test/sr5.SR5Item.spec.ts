import {SR5Item} from "../module/item/SR5Item";
import {SR5TestingDocuments} from "./utils";

export const shadowrunSR5Item = context => {
    /**
     * Setup handling for all items within this test.
     */
        const {describe, it, assert, before, after} = context;
    let testItem;

    before(async () => {
        testItem = new SR5TestingDocuments(SR5Item);
    })

    after(async () => {
        await testItem.teardown();
    })

    describe('SR5Items', () => {
        it('create a naked item of any type', async () => {
            const item = await testItem.create({type: 'action'});

            // Check basic foundry data integrity
            assert.notStrictEqual(item.id, '');
            assert.notStrictEqual(item.id, undefined);
            assert.notStrictEqual(item.id, null);

            // Check foundry item collection integrity
            const itemFromCollection = game.items?.get(item.id);
            assert.notStrictEqual(itemFromCollection, null);
            assert.strictEqual(item.id, itemFromCollection?.id);
        });

        it('update an item of any type', async () => {
            const item = await testItem.create({type: 'action'});

            assert.notProperty(item.data.data, 'test');
            await item.update({'data.test': true});

            assert.property(item.data.data, 'test');
            assert.propertyVal(item.data.data, 'test', true);
        });

        it('embedd a ammo into a weapon and not the global item collection', async () => {
            const weapon = await testItem.create({type: 'weapon'}) as SR5Item;
            const ammo = await testItem.create({type: 'ammo'}) as SR5Item;

            await weapon.createNestedItem(ammo.data);

            const embeddedItemDatas = weapon.getNestedItems();
            assert.isNotEmpty(embeddedItemDatas);
            assert.lengthOf(embeddedItemDatas, 1);

            const embeddedAmmoData = embeddedItemDatas[0];
            assert.strictEqual(embeddedAmmoData.type, ammo.data.type);

            // An embedded item should NOT appear in the items collection.
            const embeddedAmmoInCollection = game.items?.get(embeddedAmmoData._id);
            assert.strictEqual(embeddedAmmoInCollection, undefined);
        });

        it('update an embedded ammo', async () => {
            const weapon = await testItem.create({type: 'weapon'}) as SR5Item;
            const ammo = await testItem.create({type: 'ammo'}) as SR5Item;

            // Embed the item and get
            await weapon.createNestedItem(ammo.data);
            const embeddedItemDatas = weapon.getNestedItems();
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