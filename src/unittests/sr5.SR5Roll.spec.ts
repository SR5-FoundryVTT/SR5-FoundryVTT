import { SR5Roll } from './../module/rolls/SR5Roll';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';


export const shadowrunRolling = (quench: QuenchBatchContext) => {
    const {describe, it, assert, before, after} = quench;

    describe('SR5Roll', () => {
        it('Create a SR5Roll', () => {
            const roll = new SR5Roll();
        });
    });
};