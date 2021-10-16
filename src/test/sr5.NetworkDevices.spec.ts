import {SR5TestingDocuments} from "./utils";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import {NetworkDeviceFlow} from "../module/item/flows/NetworkDeviceFlow";

export const shadowrunNetworkDevices = context => {
    const {describe, it, assert, should, before, after} = context;

    let testActor;
    let testItem;
    let testScene;

    before(async () => {
        testActor = new SR5TestingDocuments(SR5Actor);
        testItem = new SR5TestingDocuments(SR5Item);
        testScene = new SR5TestingDocuments(Scene);
    })

    after(async () => {
        await testActor.teardown();
        await testItem.teardown();
        await testScene.teardown();
    })

    describe('Network Devices handling', () => {
        it('Should give a network link to given document class', async () => {
            const actor = await testActor.create({'type': 'character'});
            const link = NetworkDeviceFlow.buildLink(actor);

            const nodes = link.split('.');

            assert.strictEqual(nodes[0], 'Actor');
            assert.strictEqual(nodes.length, 2); // Actor.<randomId>;
        });

        it('Should resolve a network link back to a sidebar document', async () => {
            // Test collection Actor.
            const actor = await testActor.create({'type': 'character'});

            const link = NetworkDeviceFlow.buildLink(actor);
            const resolvedActor = await NetworkDeviceFlow.resolveLink(link);

            assert.isNotNull(resolvedActor);
            assert.strictEqual(resolvedActor?.id, actor.id);
        });

        it('Should resolve a network link back to a embedded collection document', async () => {
            const actor = await testActor.create({'type': 'character'});
            const item = await testItem.create({type: 'weapon'});
            const embeddedItems = await actor.createEmbeddedDocuments('Item', [item.data]);
            const embeddedItem = embeddedItems[0];
            // @ts-ignore // ignore undefined
            const link = NetworkDeviceFlow.buildLink(embeddedItem);
            const resolvedItem = await NetworkDeviceFlow.resolveLink(link)

            assert.isNotNull(resolvedItem);
            assert.strictEqual(resolvedItem?.id, embeddedItem?.id);
        });

        it('Should resolve a network link back to a token collection document', async () => {
            // Test TokenDokument Actor
            const scene = await testScene.create({name: 'Test'});
            const actor = await testActor.create({'type': 'character'});
            const token = await getDocumentClass('Token').create(await actor.getTokenData({x: 0, y: 0}), {parent: scene});

            // @ts-ignore // ignore null
            const link = NetworkDeviceFlow.buildLink(token);
            const resolvedToken = await NetworkDeviceFlow.resolveLink(link);

            assert.isNotNull(resolvedToken);
            assert.strictEqual(token?.id, resolvedToken?.id);
        });

        it('Should connect a device controller to a network device', async () => {
            const controller = await testItem.create({type: 'device'});
            const device = await testItem.create({type: 'weapon'});

            await NetworkDeviceFlow.addController(controller, device);

            assert.strictEqual(device.data.data.technology.networkController, controller.uuid);
            assert.strictEqual(await NetworkDeviceFlow.resolveLink(device.data.data.technology.networkController), controller);

            assert.deepEqual(controller.data.data.networkDevices, [device.uuid]);
        });

        it('Should connect a host controller to a network device', async () => {
            const controller = await testItem.create({type: 'host'});
            const device = await testItem.create({type: 'weapon'});

            await NetworkDeviceFlow.addController(controller, device);

            assert.strictEqual(device.data.data.technology.networkController, controller.uuid);
            assert.strictEqual(await NetworkDeviceFlow.resolveLink(device.data.data.technology.networkController), controller);

            assert.deepEqual(controller.data.data.networkDevices, [device.uuid]);
        });

        it('Should get all connected network devices of a controller as their Document', async () => {
            const controller = await testItem.create({type: 'device'});
            const devices = [
                await testItem.create({type: 'weapon'}),
                await testItem.create({type: 'weapon'}),
                await testItem.create({type: 'weapon'})
            ];

            for (const device of devices) {
                await NetworkDeviceFlow.addController(controller, device)
            }

            const fetchedDevices = await NetworkDeviceFlow.getNetworkDevices(controller);

            // Check for structural equality.
            assert.strictEqual(controller.data.data.networkDevices.length, 3);
            assert.strictEqual(fetchedDevices.length, 3);

            // Check for referential equality.
            for (const fetched of fetchedDevices) {
                assert.include(devices, fetched);
            }
        });
    });
};