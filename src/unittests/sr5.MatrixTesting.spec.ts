import { SR5TestingDocuments } from "./utils";
import { SR5Actor } from "../module/actor/SR5Actor";
import { SR5Item } from "../module/item/SR5Item";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { TestCreator } from "../module/tests/TestCreator";
import { BruteForceTest } from "../module/tests/BruteForceTest";
import { OpposedBruteForceTest } from "../module/tests/OpposedBruteForceTest";

export const shadowrunMatrixTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

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

    const testOptions = {showDialog: false, showMessage: false};

    describe('Matrix Testing', () => {
        it('Target a host icon and place a mark on it', async () => {
            const host = await testItem.create({ type: 'host', 'system.rating': 1 });
            const decker = await testActor.create({
                type: 'character',
                'system.attributes.logic.base': 10, 
                'system.skills.active.cybercombat.base': 10
            });

            const test = await TestCreator.fromPackAction('matrix-actions', 'brute_force', decker, testOptions) as BruteForceTest;
            test.data.iconUuid = host.uuid;
            await test.execute();

            const data = await OpposedBruteForceTest._getOpposedActionTestData(test.data, host, 'testMessageId');
            const documents = {item: host};
            const opposedTest = new OpposedBruteForceTest(data, documents, testOptions);
            await opposedTest.execute();

            const marks = decker.getAllMarks();

            assert.lengthOf(Object.keys(marks ?? {}), 1);
        });

        it('Target a host IC and place a mark on it and the host', async () => {
            const host = await testItem.create({ type: 'host', 'system.rating': 1 });
            const ic = await testActor.create({type: 'ic', 'system.host.id': host.uuid});
            const decker = await testActor.create({
                type: 'character',
                'system.attributes.logic.base': 10, 
                'system.skills.active.cybercombat.base': 10
            });

            const test = await TestCreator.fromPackAction('matrix-actions', 'brute_force', decker, testOptions) as BruteForceTest;
            test.data.iconUuid = ic.uuid;
            await test.execute();

            const data = await OpposedBruteForceTest._getOpposedActionTestData(test.data, ic, 'testMessageId');
            const documents = {actor: ic};
            const opposedTest = new OpposedBruteForceTest(data, documents, testOptions);
            await opposedTest.execute();

            const marks = decker.getAllMarks();

            assert.lengthOf(Object.keys(marks ?? {}), 2);
        });

        it('Target a host device and place a mark on it and the host', async () => {
            assert.fail();
        });

        it('Target a (gitter) device and place a mark on it', async () => {
            assert.fail();
        });

        it('Target a pan device and place a mark on it and the master/controller', async () => {
            assert.fail();
        });
    })

};