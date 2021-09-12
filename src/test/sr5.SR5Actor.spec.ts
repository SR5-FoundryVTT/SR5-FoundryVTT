import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";

export const shadowrunSR5Actor = context => {
    class TestingDocuments {
        documentClass: Entity;
        documents: Record<string, Entity> = {};

        constructor(documentClass) {
            this.documentClass = documentClass;
        }

        async create(data): Promise<SR5Actor> {
            // @ts-ignore // TODO: foundry-vtt-types 0.8
            const document = await this.documentClass.create({name: `#QUENCH_TEST_${this.documentClass.constructor}_SHOULD_HAVE_BEEN_DELETED`, ...data});
            this.documents[document.id] = document;
            return document;
        }

        async delete(id) {
            const document = this.documents[id];
            if (!document) return;
            // @ts-ignore // foundry-vtt-types 0.9
            await this.documentClass.deleteDocuments([document.data._id]);
            delete this.documents[document.id]
        }

        async teardown() {
            // @ts-ignore
            Object.values(this.documents).forEach(document => this.delete(document.id))
        }
    }

    const {describe, it, assert, before, after} = context;
    let  testActor;
    let testItem;

    before(async () => {
        testActor = new TestingDocuments(SR5Actor);
        testItem = new TestingDocuments(SR5Item);
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