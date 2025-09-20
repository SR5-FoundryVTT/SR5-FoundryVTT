import { TestCreator } from "@/module/tests/TestCreator";
import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { SR5 } from '@/module/config';

export const shadowrunMatrixDamageResist = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    const testOptions = { showDialog: false, showMessage: false };

    describe('Testing around resisting matrix damage', () => {
        it('Test IC resisting matrix damage', async () => {
            const host = await factory.createItem({ type: 'host', system: { rating: 3 } });
            const ic = await factory.createActor({ type: 'ic' });
            await ic.connectNetwork(host);
            // TODO probably change this to be 'resist_matrix' when switched to using categories for pack actions
            const test = await TestCreator.fromPackAction(SR5.packNames.MatrixActionsPack, 'matrix_damage_resist', ic, testOptions);
            assert.equal(test?.pool?.value, 6);
        });

        it('Resist Matrix Damage on an actor persona ', async () => {
            const decker = await factory.createActor({ type: 'character',
                items: [
                    {
                        name: 'QuenchTestComm',
                        type: 'device',
                        system: {
                            category: 'commlink',
                            technology: {
                                rating: 4,
                                equipped: true,
                            },
                        }
                    }
                ]
            });

            // TODO probably change this to be 'resist_matrix' when switched to using categories for pack actions
            const test = await TestCreator.fromPackAction(SR5.packNames.MatrixActionsPack, 'matrix_damage_resist', decker, testOptions);
            assert.equal(test?.pool?.value, 8);
        });
    });
};
