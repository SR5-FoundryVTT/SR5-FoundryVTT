import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunMarks = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;
    
    after(async () => { factory.destroy(); });

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
    });
};
