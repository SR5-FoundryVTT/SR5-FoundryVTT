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
            const falseMarks = decker.getMarksPlaced('Actor.123');
            assert.equal(falseMarks, 0);
        });

        it('Should set and get marks on ic', async () => {
            const decker = await testActor.create({type: 'character'}) as SR5Actor;
            const target = await testActor.create({type: 'ic'}) as SR5Actor;
            await decker.setMarks(target, 2);

            const correctMarks = decker.getMarksPlaced(target.uuid);
            assert.equal(correctMarks, 2)
        });

        it('Should NOT set marks on an character without persona data', async () => {   
            const decker = await testActor.create({type: 'character'}) as SR5Actor;
            const target = await testActor.create({type: 'character'}) as SR5Actor;
            await decker.setMarks(target, 2);

            const correctMarks = decker.getMarksPlaced(target.uuid);
            assert.equal(correctMarks, 0)
        });

        it('Should set and get marks on an item', async () => { 
            const decker = await testActor.create({type: 'character'}) as SR5Actor;
            const target = await testItem.create({type: 'weapon'}) as SR5Item;
            await decker.setMarks(target, 2);

            const correctMarks = decker.getMarksPlaced(target.uuid);
            assert.equal(correctMarks, 2)
        });

        it('Should mark the master as well when placing marks on WAN devices', async () => {
            const decker = await testActor.create({type: 'character'}) as SR5Actor;
            const target = await testItem.create({type: 'equipment'}) as SR5Item;
            const host = await testItem.create({type: 'host'}) as SR5Item;

            await target.setMasterUuid(host.uuid);
            await decker.setMarks(target, 2);

            let correctMarks = decker.getMarksPlaced(target.uuid);
            assert.equal(correctMarks, 2);

            correctMarks = decker.getMarksPlaced(host.uuid);
            assert.equal(correctMarks, 2);
        });

        it('Should mark the master as well when placing marks on PAN devices', async () => {
            const decker = await testActor.create({type: 'character'}) as SR5Actor;
            const target = await testItem.create({type: 'equipment'}) as SR5Item;
            const device = await testItem.create({type: 'device'}) as SR5Item;

            await target.setMasterUuid(device.uuid);
            await decker.setMarks(target, 2);

            let correctMarks = decker.getMarksPlaced(target.uuid);
            assert.equal(correctMarks, 2);

            correctMarks = decker.getMarksPlaced(device.uuid);
            assert.equal(correctMarks, 2);
        });
    });
};