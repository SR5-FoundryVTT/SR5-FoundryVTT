import {SR5TestingDocuments} from "./utils";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunNetworkDevices = (context: QuenchBatchContext) => {
    const {describe, it, before, after} = context;

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
        it('Handle PAN/WAN networks and device linking');
        // TODO: Redesign them with only necessary update methods in place. Instead start of with ActorData prefilled on create.
        // it('give a network link to given document class', async () => {
        //     const actor = await testActor.create({'type': 'character'});
        //     const link = MatrixNetworkFlow.buildLink(actor);

        //     const nodes = link.split('.');

        //     assert.strictEqual(nodes[0], 'Actor');
        //     assert.strictEqual(nodes.length, 2); // Actor.<randomId>;
        // });

        // it('resolve a network link back to a sidebar document', async () => {
        //     // Test collection Actor.
        //     const actor = await testActor.create({'type': 'character'});

        //     const link = MatrixNetworkFlow.buildLink(actor);
        //     const resolvedActor = await MatrixNetworkFlow.resolveLink(link);

        //     assert.isNotNull(resolvedActor);
        //     assert.strictEqual(resolvedActor?.id, actor.id);
        // });

        // it('resolve a network link back to a embedded collection document', async () => {
        //     const actor = await testActor.create({'type': 'character'});
        //     const item = await testItem.create({type: 'weapon'});
        //     const embeddedItems = await actor.createEmbeddedDocuments('Item', [item.toObject()]);
        //     const embeddedItem = embeddedItems[0];
        //     const link = MatrixNetworkFlow.buildLink(embeddedItem);
        //     const resolvedItem = await MatrixNetworkFlow.resolveLink(link)

        //     assert.isNotNull(resolvedItem);
        //     assert.strictEqual(resolvedItem?.id, embeddedItem?.id);
        // });

        // it('resolve a network link back to a token collection document', async () => {
        //     // Test TokenDocument Actor
        //     const scene = await testScene.create({name: 'Test'});
        //     const actor = await testActor.create({'type': 'character'});
        //     const token = await getDocumentClass('Token').create(await actor.getTokenData({x: 0, y: 0}), {parent: scene});

        //     // @ts-expect-error // ignore null
        //     const link = MatrixNetworkFlow.buildLink(token);
        //     const resolvedToken = await MatrixNetworkFlow.resolveLink(link);

        //     assert.isNotNull(resolvedToken);
        //     assert.strictEqual(token?.id, resolvedToken?.id);
        // });

        // it('connect a device controller to an item network device', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testItem.create({type: 'weapon'});

        //     await MatrixNetworkFlow.addDeviceToNetwork(controller, device);

        //     assert.strictEqual(device.system.technology.master, controller.uuid);
        //     assert.strictEqual(device.master()?.uuid, controller.uuid);
        //     assert.strictEqual(await MatrixNetworkFlow.resolveLink(device.system.technology.master), controller);

        //     assert.deepEqual(controller.system.slaves, [device.uuid]);
        // });

        // it('connect a device controller to a vehicle network device', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testActor.create({type: 'vehicle'});

        //     await MatrixNetworkFlow.addDeviceToNetwork(controller, device);

        //     assert.strictEqual(device.system.master, controller.uuid);
        //     assert.strictEqual(device.master()?.uuid, controller.uuid);
        //     assert.strictEqual(await MatrixNetworkFlow.resolveLink(device.system.master), controller);

        //     assert.deepEqual(controller.system.slaves, [device.uuid]);
        // });

        // it('connect a host controller to a item network device', async () => {
        //     const controller = await testItem.create({type: 'host'});
        //     const device = await testItem.create({type: 'weapon'});

        //     await MatrixNetworkFlow.addDeviceToNetwork(controller, device);

        //     assert.strictEqual(device.system.technology.master, controller.uuid);
        //     assert.strictEqual(await MatrixNetworkFlow.resolveLink(device.system.technology.master), controller);

        //     assert.deepEqual(controller.system.slaves, [device.uuid]);
        // });

        // it('connect a host controller to a vehicle network device', async () => {
        //     const controller = await testItem.create({type: 'host'});
        //     const device = await testActor.create({type: 'vehicle'});

        //     await MatrixNetworkFlow.addDeviceToNetwork(controller, device);

        //     assert.strictEqual(device.system.master, controller.uuid);
        //     assert.strictEqual(device.master()?.uuid, controller.uuid);
        //     assert.strictEqual(await MatrixNetworkFlow.resolveLink(device.system.master), controller);

        //     assert.deepEqual(controller.system.slaves, [device.uuid]);
        // });

        // it('get all connected network devices of a controller as their Document', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const devices = [
        //         await testItem.create({type: 'weapon'}),
        //         await testActor.create({type: 'vehicle'}),
        //     ];

        //     for (const device of devices) {
        //         await MatrixNetworkFlow.addDeviceToNetwork(controller, device);
        //     }

        //     const fetchedDevices = await MatrixNetworkFlow.getNetworkDevices(controller);

        //     // Check for structural equality.
        //     assert.strictEqual(controller.system.slaves.length, 2);
        //     assert.strictEqual(fetchedDevices.length, 2);

        //     // Check for referential equality.
        //     for (const fetched of fetchedDevices) {
        //         assert.include(devices, fetched);
        //     }
        // });

        // it('remove a item device from a network', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testItem.create({type: 'weapon'});

        //     await MatrixNetworkFlow.addDeviceToNetwork(controller, device);
        //     await MatrixNetworkFlow.removeDeviceLinkFromNetwork(controller, device.uuid);

        //     assert.deepEqual(controller.system.slaves, []);
        //     assert.strictEqual(device.system.technology.master, '');
        // });

        // it('remove a vehicle device from a network', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testActor.create({type: 'vehicle'});

        //     await MatrixNetworkFlow.addDeviceToNetwork(controller, device);
        //     await MatrixNetworkFlow.removeDeviceLinkFromNetwork(controller, device.uuid);

        //     assert.deepEqual(controller.system.slaves, []);
        //     assert.strictEqual(device.system.master, '');
        // });


        // it('remove an item device from a network when it is added to a new one', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const newController = await testItem.create({type: 'device'});
        //     const device = await testItem.create({type: 'weapon'});

        //     await MatrixNetworkFlow.addDeviceToNetwork(controller, device);
        //     await MatrixNetworkFlow.addDeviceToNetwork(newController, device);

        //     assert.deepEqual(controller.system.slaves, []);
        //     assert.deepEqual(newController.system.slaves, [device.uuid]);
        //     assert.strictEqual(device.system.technology.master, newController.uuid);
        // });

        // it('remove a vehicle device from a network when it is added to a new one', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const newController = await testItem.create({type: 'device'});
        //     const device = await testActor.create({type: 'vehicle'});

        //     await MatrixNetworkFlow.addDeviceToNetwork(controller, device);
        //     await MatrixNetworkFlow.addDeviceToNetwork(newController, device);

        //     assert.deepEqual(controller.system.slaves, []);
        //     assert.deepEqual(newController.system.slaves, [device.uuid]);
        //     assert.strictEqual(device.system.master, newController.uuid);
        // });

        // it("remove an item network device that doesn't exist anymore", async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testItem.create({type: 'weapon'});
        //     const deviceId = device.id;
        //     await MatrixNetworkFlow.addDeviceToNetwork(controller, device);
        //     // Simulate user deleting the network item.
        //     await device.delete();

        //     // Make sure item is actually deleted.
        //     const collectionItem = game.items?.get(deviceId);
        //     assert.strictEqual(collectionItem, undefined);

        //     // However the device is still connected to the controller.
        //     assert.strictEqual(controller.system.slaves.length, 1);
        //     await MatrixNetworkFlow.removeDeviceLinkFromNetwork(controller, controller.system.slaves[0]);

        //     assert.deepEqual(controller.system.slaves, []);
        // });

        // it("remove a vehicle network device that doesn't exist anymore", async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testActor.create({type: 'vehicle'});
        //     const deviceId = device.id;
        //     await MatrixNetworkFlow.addDeviceToNetwork(controller, device);
        //     // Simulate user deleting the network item.
        //     await device.delete();

        //     // Make sure item is actually deleted.
        //     const collectionItem = game.items?.get(deviceId);
        //     assert.strictEqual(collectionItem, undefined);

        //     // However the device is still connected to the controller.
        //     assert.strictEqual(controller.system.slaves.length, 1);
        //     await MatrixNetworkFlow.removeDeviceLinkFromNetwork(controller, controller.system.slaves[0]);

        //     assert.deepEqual(controller.system.slaves, []);
        // });

        // it('remove all devices from a controller', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const itemDevice = await testItem.create({type: 'weapon'});
        //     const vehicleDevice = await testActor.create({type: 'vehicle'});
        //     const devices = [
        //         itemDevice,
        //         vehicleDevice,
        //     ];

        //     for (const device of devices) {
        //         await MatrixNetworkFlow.addDeviceToNetwork(controller, device);
        //     }

        //     await MatrixNetworkFlow.removeAllDevicesFromNetwork(controller);

        //     assert.deepEqual(controller.system.slaves, []);
        //     assert.strictEqual(itemDevice.system.technology.master, '');
        //     assert.strictEqual(vehicleDevice.system.master, '');
        // });

        // it('should not allow non-vehicle actors to be added to controller', async() => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testActor.create({type: 'character'});

        //     await MatrixNetworkFlow.addDeviceToNetwork(controller, device);

        //     assert.deepEqual(controller.system.slaves, []);
        //     assert.strictEqual(device.system.master, undefined);
        // });
    });
};