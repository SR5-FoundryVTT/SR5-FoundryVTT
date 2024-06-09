import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import {SR5TestingDocuments} from "./utils";

export const shadowrunSR5Actor = (context: QuenchBatchContext) => {
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
        it('create a naked actor of any type', async () => {
            const actor = await testActor.create({type: 'character'});

            // Check basic foundry data integrity
            assert.notStrictEqual(actor.id, '');
            assert.notStrictEqual(actor.id, undefined);
            assert.notStrictEqual(actor.id, null);

            // Check foundry item collection integrity
            const fromCollection = game.actors?.get(actor.id);
            assert.isOk(fromCollection);
            assert.strictEqual(actor.id, fromCollection?.id);
        });

        it('update an actor of any type', async () => {
            const actor = await testActor.create({type: 'character'});

            assert.notProperty(actor.system, 'test');
            await actor.update({'system.test': true});

            assert.property(actor.system, 'test');
            assert.propertyVal(actor.system, 'test', true);
        });

        it('embedd a weapon into an actor and not the global item colection', async () => {
            const actor = await testActor.create({type: 'character'});
            const weapon = await testItem.create({type: 'weapon'});

            await actor.createEmbeddedDocuments('Item', [weapon.toObject()]);

            const ownedItems = Array.from(actor.items) as SR5Item[];
            assert.isNotEmpty(ownedItems);
            assert.lengthOf(ownedItems, 1);

            const ownedItem = ownedItems[0];
            assert.strictEqual(ownedItem.type, weapon.type);

            // An owned item should NOT appear in the items collection.
            const ownedInCollection = game.items?.get(ownedItem.id as string);
            assert.isNotOk(ownedInCollection);
        });
    });
}