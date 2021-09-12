import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import {SR5TestingDocuments} from "./utils";

export const shadowrunSR5Actor = context => {
    const {describe, it, assert, before, after} = context;
    let  testActor;
    let testItem;

    before(async () => {
        testActor = new SR5TestingDocuments(SR5Actor);
        testItem = new SR5TestingDocuments(SR5Item);
    })

    after(async () => {
        await testActor.teardown();
        await testItem.teardown();
    })

    describe('SR5Actor', () => {
        it('Should create a naked actor of any type', async () => {
            const actor = await testActor.create({type: 'character'});

            // Check basic foundry data integrity
            assert.notStrictEqual(actor.id, '');
            assert.notStrictEqual(actor.id, undefined);
            assert.notStrictEqual(actor.id, null);

            // Check foundry item collection integrity
            const fromCollection = game.actors.get(actor.id);
            assert.isOk(fromCollection);
            assert.strictEqual(actor.id, fromCollection.id);
        });

        it('Should update an actor of any time', async () => {
            const actor = await testActor.create({type: 'character'});

            assert.notProperty(actor.data.data, 'test');
            await actor.update({'data.test': true});

            assert.property(actor.data.data, 'test');
            assert.propertyVal(actor.data.data, 'test', true);
        });

        it('Should embedd a weapon into an actor and not the global item colection', async () => {
            const actor = await testActor.create({type: 'character'});
            const weapon = await testItem.create({type: 'weapon'});

            await actor.createOwnedItem(weapon.data);

            const ownedItems = Array.from(actor.items) as SR5Item[];
            assert.isNotEmpty(ownedItems);
            assert.lengthOf(ownedItems, 1);

            const ownedItem = ownedItems[0];
            assert.strictEqual(ownedItem.type, weapon.data.type);

            // An owned item should NOT appear in the items collection.
            const ownedInCollection = game.items.get(ownedItem.id);
            assert.isNotOk(ownedInCollection);
        });

        describe('Active Effects', () => {
            it('Should apply all owned items active effects', async () => {
                assert.isOk(false);
            });
        })
    });
}