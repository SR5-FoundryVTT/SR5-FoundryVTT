import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5TestingDocuments } from './utils';
import { SR5Item } from '../module/item/SR5Item';
import { SR5Actor } from '../module/actor/SR5Actor';

export const shadowrunMatrixFlow = (context: QuenchBatchContext) => {
    const { describe, it, assert, should, before, after } = context;

    let testActor;
    let testItem;

    before(async () => {
        testActor = new SR5TestingDocuments<SR5Actor>(SR5Actor);
        testItem = new SR5TestingDocuments<SR5Item>(SR5Item);
    });

    after(async () => {
        await testActor.teardown();
        await testItem.teardown();
    });


    describe('MatrixFlow testing', () => {
        it('should reboot device and trigger all resulting effects', async () => {
            
        });
        it('should apply dumpshock damage only when using vr', async () => {});
        it('should apply dumpshock damage for cold sim', async () => {});
        it('should apply dumpshock damage for hot sim', async () => {});
    })
};