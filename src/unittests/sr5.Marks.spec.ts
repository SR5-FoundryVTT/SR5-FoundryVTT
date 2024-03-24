import {SR5TestingDocuments} from "./utils";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunMarks = (context: QuenchBatchContext) => {
    const {describe, it, assert, before, after} = context;

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

    describe('Matrix Marks handling', () => {
        it('Should return zero marks for an actor without any marks', async () => {
            const decker = await testActor.create({type: 'character'}) as SR5Actor;
            const falseMarks = decker.getMarksById('Actor.123');
            assert.equal(falseMarks, 0);
        });

        it('Should set and get marks on an actor', async () => {
            const decker = await testActor.create({type: 'character'}) as SR5Actor;
            const target = await testActor.create({type: 'character'}) as SR5Actor;
            await decker.setMarks(target, 2);

            const correctMarks = decker.getMarksById(target.uuid);
            assert.equal(correctMarks, 2)

            const falseMarks = decker.getMarksById('Actor.123');
            assert.equal(falseMarks, 0);
        });

        it('Should set and get marks on an item', async () => { 
            const decker = await testActor.create({type: 'character'}) as SR5Actor;
            const target = await testItem.create({type: 'weapon'}) as SR5Item;
            await decker.setMarks(target, 2);

            const correctMarks = decker.getMarksById(target.uuid);
            assert.equal(correctMarks, 2)
        });
    });
};