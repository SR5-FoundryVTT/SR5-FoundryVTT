import {SR5TestingDocuments} from "./utils";
import {SR5Actor} from "../module/actor/SR5Actor";
import {SR5Item} from "../module/item/SR5Item";
import {NetworkDeviceFlow} from "../module/item/flows/NetworkDeviceFlow";
import { QuenchBatchContext } from "@ethaks/fvtt-quench";

export const shadowrunNetworkDevices = (context: QuenchBatchContext) => {
    const {describe, it, assert, before, after} = context;

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
        it('Handle PAN/WAN networks and device linking', () => {
            assert.fail('Test suite is deactivated');
        })
        // TODO: Redesign them with only necessary update methods in place. Instead start of with ActorData prefilled on create.
        // it('give a network link to given document class', async () => {
        //     const actor = await testActor.create({'type': 'character'});
        //     const link = NetworkDeviceFlow.buildLink(actor);

        //     const nodes = link.split('.');

        //     assert.strictEqual(nodes[0], 'Actor');
        //     assert.strictEqual(nodes.length, 2); // Actor.<randomId>;
        // });

        // it('resolve a network link back to a sidebar document', async () => {
        //     // Test collection Actor.
        //     const actor = await testActor.create({'type': 'character'});

        //     const link = NetworkDeviceFlow.buildLink(actor);
        //     const resolvedActor = await NetworkDeviceFlow.resolveLink(link);

        //     assert.isNotNull(resolvedActor);
        //     assert.strictEqual(resolvedActor?.id, actor.id);
        // });

        // it('resolve a network link back to a embedded collection document', async () => {
        //     const actor = await testActor.create({'type': 'character'});
        //     const item = await testItem.create({type: 'weapon'});
        //     const embeddedItems = await actor.createEmbeddedDocuments('Item', [item.toObject()]);
        //     const embeddedItem = embeddedItems[0];
        //     const link = NetworkDeviceFlow.buildLink(embeddedItem);
        //     const resolvedItem = await NetworkDeviceFlow.resolveLink(link)

        //     assert.isNotNull(resolvedItem);
        //     assert.strictEqual(resolvedItem?.id, embeddedItem?.id);
        // });

        // it('resolve a network link back to a token collection document', async () => {
        //     // Test TokenDocument Actor
        //     const scene = await testScene.create({name: 'Test'});
        //     const actor = await testActor.create({'type': 'character'});
        //     const token = await getDocumentClass('Token').create(await actor.getTokenData({x: 0, y: 0}), {parent: scene});

        //     // @ts-expect-error // ignore null
        //     const link = NetworkDeviceFlow.buildLink(token);
        //     const resolvedToken = await NetworkDeviceFlow.resolveLink(link);

        //     assert.isNotNull(resolvedToken);
        //     assert.strictEqual(token?.id, resolvedToken?.id);
        // });

        // it('connect a device controller to an item network device', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testItem.create({type: 'weapon'});

        //     await NetworkDeviceFlow.addDeviceToNetwork(controller, device);

        //     assert.strictEqual(device.system.technology.networkController, controller.uuid);
        //     assert.strictEqual(device.getNetworkController(), controller.uuid);
        //     assert.strictEqual(await NetworkDeviceFlow.resolveLink(device.system.technology.networkController), controller);

        //     assert.deepEqual(controller.system.networkDevices, [device.uuid]);
        // });

        // it('connect a device controller to a vehicle network device', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testActor.create({type: 'vehicle'});

        //     await NetworkDeviceFlow.addDeviceToNetwork(controller, device);

        //     assert.strictEqual(device.system.networkController, controller.uuid);
        //     assert.strictEqual(device.getNetworkController(), controller.uuid);
        //     assert.strictEqual(await NetworkDeviceFlow.resolveLink(device.system.networkController), controller);

        //     assert.deepEqual(controller.system.networkDevices, [device.uuid]);
        // });

        // it('connect a host controller to a item network device', async () => {
        //     const controller = await testItem.create({type: 'host'});
        //     const device = await testItem.create({type: 'weapon'});

        //     await NetworkDeviceFlow.addDeviceToNetwork(controller, device);

        //     assert.strictEqual(device.system.technology.networkController, controller.uuid);
        //     assert.strictEqual(await NetworkDeviceFlow.resolveLink(device.system.technology.networkController), controller);

        //     assert.deepEqual(controller.system.networkDevices, [device.uuid]);
        // });

        // it('connect a host controller to a vehicle network device', async () => {
        //     const controller = await testItem.create({type: 'host'});
        //     const device = await testActor.create({type: 'vehicle'});

        //     await NetworkDeviceFlow.addDeviceToNetwork(controller, device);

        //     assert.strictEqual(device.system.networkController, controller.uuid);
        //     assert.strictEqual(device.getNetworkController(), controller.uuid);
        //     assert.strictEqual(await NetworkDeviceFlow.resolveLink(device.system.networkController), controller);

        //     assert.deepEqual(controller.system.networkDevices, [device.uuid]);
        // });

        // it('get all connected network devices of a controller as their Document', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const devices = [
        //         await testItem.create({type: 'weapon'}),
        //         await testActor.create({type: 'vehicle'}),
        //     ];

        //     for (const device of devices) {
        //         await NetworkDeviceFlow.addDeviceToNetwork(controller, device);
        //     }

        //     const fetchedDevices = await NetworkDeviceFlow.getNetworkDevices(controller);

        //     // Check for structural equality.
        //     assert.strictEqual(controller.system.networkDevices.length, 2);
        //     assert.strictEqual(fetchedDevices.length, 2);

        //     // Check for referential equality.
        //     for (const fetched of fetchedDevices) {
        //         assert.include(devices, fetched);
        //     }
        // });

        // it('remove a item device from a network', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testItem.create({type: 'weapon'});

        //     await NetworkDeviceFlow.addDeviceToNetwork(controller, device);
        //     await NetworkDeviceFlow.removeDeviceLinkFromNetwork(controller, device.uuid);

        //     assert.deepEqual(controller.system.networkDevices, []);
        //     assert.strictEqual(device.system.technology.networkController, '');
        // });

        // it('remove a vehicle device from a network', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testActor.create({type: 'vehicle'});

        //     await NetworkDeviceFlow.addDeviceToNetwork(controller, device);
        //     await NetworkDeviceFlow.removeDeviceLinkFromNetwork(controller, device.uuid);

        //     assert.deepEqual(controller.system.networkDevices, []);
        //     assert.strictEqual(device.system.networkController, '');
        // });


        // it('remove an item device from a network when it is added to a new one', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const newController = await testItem.create({type: 'device'});
        //     const device = await testItem.create({type: 'weapon'});

        //     await NetworkDeviceFlow.addDeviceToNetwork(controller, device);
        //     await NetworkDeviceFlow.addDeviceToNetwork(newController, device);

        //     assert.deepEqual(controller.system.networkDevices, []);
        //     assert.deepEqual(newController.system.networkDevices, [device.uuid]);
        //     assert.strictEqual(device.system.technology.networkController, newController.uuid);
        // });

        // it('remove a vehicle device from a network when it is added to a new one', async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const newController = await testItem.create({type: 'device'});
        //     const device = await testActor.create({type: 'vehicle'});

        //     await NetworkDeviceFlow.addDeviceToNetwork(controller, device);
        //     await NetworkDeviceFlow.addDeviceToNetwork(newController, device);

        //     assert.deepEqual(controller.system.networkDevices, []);
        //     assert.deepEqual(newController.system.networkDevices, [device.uuid]);
        //     assert.strictEqual(device.system.networkController, newController.uuid);
        // });

        // it("remove an item network device that doesn't exist anymore", async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testItem.create({type: 'weapon'});
        //     const deviceId = device.id;
        //     await NetworkDeviceFlow.addDeviceToNetwork(controller, device);
        //     // Simulate user deleting the network item.
        //     await device.delete();

        //     // Make sure item is actually deleted.
        //     const collectionItem = game.items?.get(deviceId);
        //     assert.strictEqual(collectionItem, undefined);

        //     // However the device is still connected to the controller.
        //     assert.strictEqual(controller.system.networkDevices.length, 1);
        //     await NetworkDeviceFlow.removeDeviceLinkFromNetwork(controller, controller.system.networkDevices[0]);

        //     assert.deepEqual(controller.system.networkDevices, []);
        // });

        // it("remove a vehicle network device that doesn't exist anymore", async () => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testActor.create({type: 'vehicle'});
        //     const deviceId = device.id;
        //     await NetworkDeviceFlow.addDeviceToNetwork(controller, device);
        //     // Simulate user deleting the network item.
        //     await device.delete();

        //     // Make sure item is actually deleted.
        //     const collectionItem = game.items?.get(deviceId);
        //     assert.strictEqual(collectionItem, undefined);

        //     // However the device is still connected to the controller.
        //     assert.strictEqual(controller.system.networkDevices.length, 1);
        //     await NetworkDeviceFlow.removeDeviceLinkFromNetwork(controller, controller.system.networkDevices[0]);

        //     assert.deepEqual(controller.system.networkDevices, []);
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
        //         await NetworkDeviceFlow.addDeviceToNetwork(controller, device);
        //     }

        //     await NetworkDeviceFlow.removeAllDevicesFromNetwork(controller);

        //     assert.deepEqual(controller.system.networkDevices, []);
        //     assert.strictEqual(itemDevice.system.technology.networkController, '');
        //     assert.strictEqual(vehicleDevice.system.networkController, '');
        // });

        // it('should not allow non-vehicle actors to be added to controller', async() => {
        //     const controller = await testItem.create({type: 'device'});
        //     const device = await testActor.create({type: 'character'});

        //     await NetworkDeviceFlow.addDeviceToNetwork(controller, device);

        //     assert.deepEqual(controller.system.networkDevices, []);
        //     assert.strictEqual(device.system.networkController, undefined);
        // });
    });
};