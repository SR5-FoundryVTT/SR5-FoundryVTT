import { TestCreator } from "@/module/tests/TestCreator";
import { SR5TestFactory } from "./utils";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { BruteForceTest } from "@/module/tests/BruteForceTest";
import { OpposedBruteForceTest } from "@/module/tests/OpposedBruteForceTest";
import { SR5 } from '@/module/config';

export const shadowrunMatrixTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    const testOptions = { showDialog: false, showMessage: false };

    describe('Matrix Testing around placing Marks', () => {
        it('Target a host icon and place a mark on it', async () => {
            const host = await factory.createItem({ type: 'host', system: { rating: 1 } });
            const decker = await factory.createActor({
                type: 'character',
                system: {
                    attributes: { logic: { base: 10 } },
                    skills: { active: { cybercombat: { base: 10 } } }
                }
            });

            const test = await TestCreator.fromPackAction(SR5.packNames.MatrixActionsPack, 'brute_force', decker, testOptions) as BruteForceTest;
            test.data.iconUuid = host.uuid;
            await test.execute();

            const data = await OpposedBruteForceTest._getOpposedActionTestData(test.data, host, 'testMessageId');
            const documents = { item: host };
            const opposedTest = new OpposedBruteForceTest(data, documents, testOptions);
            await opposedTest.execute();

            // TODO: In this case, does placing a mark on the host place marks on all it's devices?! or all icons?! What about personas?

            const marksData = decker.marksData ?? [];

            assert.lengthOf(marksData, 1);
        });

        it('Target a host IC and place a mark on it and the host', async () => {
            const host = await factory.createItem({ type: 'host', system: { rating: 1 } });
            const ic = await factory.createActor({ type: 'ic' });
            await ic.connectNetwork(host);
            const decker = await factory.createActor({
                type: 'character',
                system: {
                    attributes: { logic: { base: 10 } },
                    skills: { active: { cybercombat: { base: 10 } } }
                }
            });

            const test = await TestCreator.fromPackAction(SR5.packNames.MatrixActionsPack, 'brute_force', decker, testOptions) as BruteForceTest;
            test.data.iconUuid = ic.uuid;
            await test.execute();

            const data = await OpposedBruteForceTest._getOpposedActionTestData(test.data, ic, 'testMessageId');
            const documents = { actor: ic };
            const opposedTest = new OpposedBruteForceTest(data, documents, testOptions);
            await opposedTest.execute();

            const marksData = decker.marksData ?? [];

            assert.lengthOf(marksData, 2);
        });

        it('Target a host device and place a mark on it and the host', async () => {
            const host = await factory.createItem({ type: 'host', system: { rating: 1 } });
            const device = await factory.createItem({ type: 'device' });
            await host.addSlave(device);

            const decker = await factory.createActor({ type: 'character' });

            await decker.setMarks(device, 1);

            const marksData = decker.marksData ?? []; 

            assert.lengthOf(marksData, 2);

            const markUuids = [host.uuid, device.uuid];
            for (const {marks, uuid} of marksData){
                assert.equal(marks, 1);
                assert.include(markUuids, uuid);
            }
        });

        it('Target a (gitter) device and place a mark on it', async () => {
            const device = await factory.createItem({ type: 'device' });
            const decker = await factory.createActor({ type: 'character' });
            await decker.setMarks(device, 1);

            const marks = decker.marksData; 
            assert.lengthOf(Object.keys(marks ?? {}), 1);
        });

        it('Target a pan device and place a mark on it and the master/controller', async () => {
            const device = await factory.createItem({ type: 'device' });
            const controller = await factory.createItem({ type: 'device', system: { category: 'commlink' } });
            const decker = await factory.createActor({ type: 'character' });

            await controller.addSlave(device);
            await decker.setMarks(device, 1);

            const marksData = decker.marksData ?? []; 
            assert.lengthOf(marksData, 2);

            const markUuids = [device.uuid, controller.uuid];
            for (const {marks, uuid} of marksData) {
                assert.equal(marks, 1);
                assert.include(markUuids, uuid);
            }
        });
    });
};
