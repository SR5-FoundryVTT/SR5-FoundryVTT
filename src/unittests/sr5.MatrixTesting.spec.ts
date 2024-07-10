import { ActorMarksFlow } from './../module/actor/flows/ActorMarksFlow';
import { SR5TestingDocuments } from "./utils";
import { SR5Actor } from "../module/actor/SR5Actor";
import { SR5Item } from "../module/item/SR5Item";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";
import { TestCreator } from "../module/tests/TestCreator";
import { BruteForceTest } from "../module/tests/BruteForceTest";
import { OpposedBruteForceTest } from "../module/tests/OpposedBruteForceTest";
import { MarkPlacementFlow } from "../module/tests/flows/MarkPlacementFlow";
import { DataDefaults } from '../module/data/DataDefaults';
import { Helpers } from '../module/helpers';

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

    const testOptions = { showDialog: false, showMessage: false };

    describe('Matrix Testing around placing Marks', () => {
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
            const documents = { item: host };
            const opposedTest = new OpposedBruteForceTest(data, documents, testOptions);
            await opposedTest.execute();

            // TODO: In this case, does placing a mark on the host place marks on all it's devices?! or all icons?! What about personas?

            const marks = decker.getAllMarks();

            assert.lengthOf(Object.keys(marks ?? {}), 1);
        });

        it('Target a host IC and place a mark on it and the host', async () => {
            const host = await testItem.create({ type: 'host', 'system.rating': 1 });
            const ic = await testActor.create({ type: 'ic', 'system.host.id': host.uuid });
            const decker = await testActor.create({
                type: 'character',
                'system.attributes.logic.base': 10,
                'system.skills.active.cybercombat.base': 10
            });

            const test = await TestCreator.fromPackAction('matrix-actions', 'brute_force', decker, testOptions) as BruteForceTest;
            test.data.iconUuid = ic.uuid;
            await test.execute();

            const data = await OpposedBruteForceTest._getOpposedActionTestData(test.data, ic, 'testMessageId');
            const documents = { actor: ic };
            const opposedTest = new OpposedBruteForceTest(data, documents, testOptions);
            await opposedTest.execute();

            const marks = decker.getAllMarks();

            assert.lengthOf(Object.keys(marks ?? {}), 2);
        });

        it('Target a host device and place a mark on it and the host', async () => {
            const host = await testItem.create({ type: 'host', 'system.rating': 1 }) as SR5Item;
            const device = await testItem.create({ type: 'device' });
            await host.addSlave(device);

            const decker = await testActor.create({ type: 'character' }) as SR5Actor;

            await decker.setMarks(device, 1);

            const marks = decker.getAllMarks(); 

            assert.lengthOf(Object.keys(marks ?? {}), 2);

            const markUuids = [ActorMarksFlow.buildMarkUuid(host.uuid), ActorMarksFlow.buildMarkUuid(device.uuid)];
            for (const [markUuid, count] of Object.entries(marks ?? {})) {
                assert.equal(count, 1);
                assert.include(markUuids, markUuid);
            }
        });

        it('Target a (gitter) device and place a mark on it', async () => {
            const device = await testItem.create({ type: 'device' });
            const decker = await testActor.create({ type: 'character' }) as SR5Actor;
            await decker.setMarks(device, 1);

            const marks = decker.getAllMarks(); 
            assert.lengthOf(Object.keys(marks ?? {}), 1);
        });

        it('Target a pan device and place a mark on it and the master/controller', async () => {
            const device = await testItem.create({ type: 'device' });
            const controller = await testItem.create({ type: 'device', 'system.category': 'commlink' }) as SR5Item;
            const decker = await testActor.create({ type: 'character' }) as SR5Actor;

            await controller.addSlave(device);
            await decker.setMarks(device, 1);

            const marks = decker.getAllMarks(); 
            assert.lengthOf(Object.keys(marks ?? {}), 2);

            const markUuids = [ActorMarksFlow.buildMarkUuid(device.uuid), ActorMarksFlow.buildMarkUuid(controller.uuid)];
            for (const [markUuid, count] of Object.entries(marks ?? {})) {
                assert.equal(count, 1);
                assert.include(markUuids, markUuid);
            }
        });
    });

};