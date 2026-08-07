import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { Helpers } from "@/module/helpers";
import { MarksStorage } from "@/module/storage/MarksStorage";

export const shadowrunMarks = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;
    
    after(async () => { await factory.destroy(); });

    describe('Matrix Marks handling', () => {
        it('Should return zero marks for an actor without any marks', async () => {
            const decker = await factory.createActor({ type: 'character' });
            const falseMarks = decker.getMarksPlaced('Actor.123');
            assert.equal(falseMarks, 0);
        });

        it('Should set and get marks on ic', async () => {
            const decker = await factory.createActor({ type: 'character' });
            const target = await factory.createActor({ type: 'ic' });
            await decker.setMarks(target, 2);

            const correctMarks = decker.getMarksPlaced(target.uuid);
            assert.equal(correctMarks, 2)
        });

        it('Should NOT set marks on an character without persona data', async () => {
            const decker = await factory.createActor({ type: 'character' });
            const target = await factory.createActor({ type: 'character' });
            await decker.setMarks(target, 2);

            const correctMarks = decker.getMarksPlaced(target.uuid);
            assert.equal(correctMarks, 0)
        });

        it('Should set and get marks on an item', async () => {
            const decker = await factory.createActor({ type: 'character' });
            const target = await factory.createItem({ type: 'weapon' });
            await decker.setMarks(target, 2);

            const correctMarks = decker.getMarksPlaced(target.uuid);
            assert.equal(correctMarks, 2)
        });

        it('Should mark the master as well when placing marks on WAN devices', async () => {
            const decker = await factory.createActor({ type: 'character' });
            const target = await factory.createItem({ type: 'equipment' });
            const host = await factory.createItem({ type: 'host' });

            await target.setMasterUuid(host.uuid);
            await decker.setMarks(target, 2);

            let correctMarks = decker.getMarksPlaced(target.uuid);
            assert.equal(correctMarks, 2);

            correctMarks = decker.getMarksPlaced(host.uuid);
            assert.equal(correctMarks, 2);
        });

        it('Should mark the master as well when placing marks on PAN devices', async () => {
            const decker = await factory.createActor({ type: 'character' });
            const target = await factory.createItem({ type: 'equipment' });
            const device = await factory.createItem({ type: 'device' });

            await target.setMasterUuid(device.uuid);
            await decker.setMarks(target, 2);

            let correctMarks = decker.getMarksPlaced(target.uuid);
            assert.equal(correctMarks, 2);

            correctMarks = decker.getMarksPlaced(device.uuid);
            assert.equal(correctMarks, 2);
        });

        it('Should NOT mark the grid as well when placing marks on grid connected devices', async () => {
            const decker = await factory.createActor({ type: 'character' });
            const target = await factory.createItem({ type: 'equipment' });
            const grid = await factory.createItem({ type: 'grid' });

            await grid.addSlave(target);
            await decker.setMarks(target, 2);

            let correctMarks = decker.getMarksPlaced(target.uuid);
            assert.equal(correctMarks, 2);

            correctMarks = decker.getMarksPlaced(grid.uuid);
            assert.equal(correctMarks, 0);
        });

        it('Should remove one cleared mark from actor data and global marks storage', async () => {
            const decker = await factory.createActor({ type: 'character' });
            const firstTarget = await factory.createItem({ type: 'device' });
            const secondTarget = await factory.createItem({ type: 'device' });

            await decker.setMarks(firstTarget, 1);
            await decker.setMarks(secondTarget, 1);
            await decker.clearMark(firstTarget.uuid);

            assert.equal(decker.getMarksPlaced(firstTarget.uuid), 0);
            assert.equal(decker.getMarksPlaced(secondTarget.uuid), 1);
            assert.sameMembers(MarksStorage.retrieveMarks(decker), [secondTarget.uuid]);
            assert.sameMembers(MarksStorage.getMarksRelations(decker.uuid), [secondTarget.uuid]);
        });

        it('Should remove all cleared marks from actor data and global marks storage', async () => {
            const decker = await factory.createActor({ type: 'character' });
            const target = await factory.createItem({ type: 'device' });

            await decker.setMarks(target, 1);
            await decker.clearMarks();

            assert.lengthOf(decker.marksData ?? [], 0);
            assert.notProperty(MarksStorage.getStorage(), Helpers.uuidForStorage(decker.uuid));
        });

        it('Should remove global marks storage relations when the marking actor is deleted', async () => {
            const decker = await factory.createActor({ type: 'character' });
            const target = await factory.createItem({ type: 'device' });

            await decker.setMarks(target, 1);
            await decker.delete();
            factory.actors.splice(factory.actors.indexOf(decker), 1);

            assert.notProperty(MarksStorage.getStorage(), Helpers.uuidForStorage(decker.uuid));
        });

        it('Should clear actor marks and empty storage relations when the marked item is deleted', async () => {
            const decker = await factory.createActor({ type: 'character' });
            const target = await factory.createItem({ type: 'device' });

            await decker.setMarks(target, 1);
            await target.delete();
            factory.items.splice(factory.items.indexOf(target), 1);

            assert.equal(decker.getMarksPlaced(target.uuid), 0);
            assert.notProperty(MarksStorage.getStorage(), Helpers.uuidForStorage(decker.uuid));
        });
    });
};
