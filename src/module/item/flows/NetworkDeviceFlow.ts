import {SR5Actor} from "../../actor/SR5Actor";
import {SR5Item} from "../SR5Item";
import {SocketMessage} from "../../sockets";
import {FLAGS} from "../../constants";
import SocketAddNetworkControllerMessageData = Shadowrun.SocketAddNetworkControllerMessageData;

export class NetworkDeviceFlow {
    /**
     * Abstract away Foundry uuid system to allow for further implementation changes and typing restrictions.
     *
     * @param target Whatever Document you want to link to.
     */
    static buildLink(target: SR5Item|SR5Actor|TokenDocument) {
        return target.uuid;
    }

    /**
     * Repacking FoundryVTT fromUuid without async promise to make it usable in sync functions.
     *
     * @param link
     */
    static resolveLink(link: string): SR5Item|undefined {
        let parts = link.split(".");
        let doc;

        // Compendium Documents
        if (parts[0] === "Compendium") {
            parts.shift();
            const [scope, packName, id] = parts.slice(0, 3);
            parts = parts.slice(3);
            const pack = game.packs.get(`${scope}.${packName}`);
            if (!pack) return;
            doc = pack.getDocument(id);
        }

        // World Documents
        else {
            const [docName, docId] = parts.slice(0, 2);
            parts = parts.slice(2);
            const collection = CONFIG[docName].collection.instance;
            doc = collection.get(docId);
        }

        // Embedded Documents
        while (doc && (parts.length > 1)) {
            const [embeddedName, embeddedId] = parts.slice(0, 2);
            doc = doc.getEmbeddedDocument(embeddedName, embeddedId);
            parts = parts.slice(2);
        }
        return doc || null;
    }

    static async emitAddNetworkControllerSocketMessage(controller: SR5Item, networkDevice: SR5Item) {
        const controllerLink = NetworkDeviceFlow.buildLink(controller);
        const networkDeviceLink = NetworkDeviceFlow.buildLink(networkDevice);

        await SocketMessage.emitForGM(FLAGS.addNetworkController, {controllerLink, networkDeviceLink});
    }

    /**
     * Handle socket messages adding a device to the device list of netowrk
     * @param message
     */
    static async _handleAddNetworkControllerSocketMessage(message: SocketAddNetworkControllerMessageData) {
        console.log('Shadowrun 5e | Handle add network controller socket message', message);
        if (!game.user?.isGM) return console.error(`Shadowrun 5e | Abort handling of message. Current user isn't a GM`, game.user);

        const controller = NetworkDeviceFlow.resolveLink(message.data.controllerLink);
        const device = NetworkDeviceFlow.resolveLink(message.data.networkDeviceLink);

        if (!controller || !device) return console.error('Shadowrun 5e | Either the networks controller or device did not resolve.');

        await NetworkDeviceFlow._addDeviceToNetwork(controller, device);
    }

    /**
     * Connect a device to a network controller.
     *
     * A network controller is the device managing the PAN/WAN.
     * A network device is to be added to the network managed by the controller.
     *
     * @param controller
     * @param device
     */
    static async addDeviceToNetwork(controller: SR5Item, device: SR5Item) {
        console.log(`Shadowrun5e | Adding an the item ${device.name} to the controller ${controller.name}`, this, device);
        const technologyData = device.getTechnologyData();
        if (!technologyData) return ui.notifications?.error(game.i18n.localize('SR5.Errors.CanOnlyAddTechnologyItemsToANetwork'));
        if (!controller.isDevice() && !controller.isHost()) return;

        if (game.user?.isGM)
            await NetworkDeviceFlow._addDeviceToNetwork(controller, device);
        else
            await NetworkDeviceFlow.emitAddNetworkControllerSocketMessage(controller, device);
    }

    /**
     * Handle everything around adding a device to a controller, including removing it from already connected networks.
     *
     * Note: This method needs GM access
     *
     * @param controller
     * @param device
     */
    private static async _addDeviceToNetwork(controller: SR5Item, device: SR5Item): Promise<any> {
        if (!game.user?.isGM) return console.error(`User isn't owner or GM of this device`, controller);

        const controllerData = controller.asDeviceData() || controller.asHostData();
        if (!controllerData) return console.error(`Device isn't capable of accepting network devices`, controller);
        const technologyData = device.getTechnologyData();
        if (!technologyData) return console.error(`'Device can't be added to a network`);

        // Remove device from a network it's already connected to.
        if (technologyData.networkController) await NetworkDeviceFlow._removeDeviceFromNetwork(device);

        // Add the device to a new controller
        const controllerLink = NetworkDeviceFlow.buildLink(controller);
        await device.update({'data.technology.networkController': controllerLink});

        // Add the device to the list of devices of the controller.
        const networkDeviceLink = NetworkDeviceFlow.buildLink(device);
        const networkDevices = controllerData.data.networkDevices;
        if (networkDevices.includes(networkDeviceLink)) return;

        return await controller.update({'data.networkDevices': [...networkDevices, networkDeviceLink]});
    }

    /**
     * This method is removing a device from the controller devices list. It doesn't remove the controller reference itself.

     * @param device A network device that's connected to a controller.
     */
    private static async _removeDeviceFromNetwork(device: SR5Item|undefined) {
        if (!device) return;

        console.log(`Shadowrun 5e | Removing device ${device.name} from it's controller`);
        const technologyData = device.getTechnologyData();
        if (!technologyData || !technologyData.networkController) return;

        const controller = NetworkDeviceFlow.resolveLink(technologyData.networkController);
        if (!controller) return;
        // In case of upstream error that added the wrong item type.
        const controllerData = controller.asControllerData();
        if (!controllerData) return;

        const deviceLink = NetworkDeviceFlow.buildLink(device);
        const networkDevices = controllerData.data.networkDevices.filter(existingLink => existingLink !== deviceLink);

        await controller.update({'data.networkDevices': networkDevices});
    }

    static async removeDeviceLinkFromNetwork(controller: SR5Item, deviceLink: string) {
        console.log(`Shadowrun 5e | Removing device with uuid ${deviceLink} from network`);
        const controllerData = controller.asControllerData();
        const device = NetworkDeviceFlow.resolveLink(deviceLink);

        // Remove an existing item from the network.
        if (device) {
            const technologyData = device.getTechnologyData();
            if (technologyData) await device.update({'data.technology.networkController':  ''});
        }

        // Remove the deviceLink from the controller.
        if (!controllerData) return console.error(`Shadowrun 5e | A device can't be removed from a item type without controller ability`, controller);

        const networkDevices = controllerData.data.networkDevices.filter(existingLink => existingLink !== deviceLink);
        await controller.update({'data.networkDevices': networkDevices});
    }


    /**
     * @param controller
     */
    static async removeAllDevicesFromNetwork(controller: SR5Item) {
        console.log(`Shadowrun 5e | Removing all devices from network ${controller.name}`);
        const controllerData = controller.asControllerData();
        if (!controllerData) return;

        const networkDevices = controllerData.data.networkDevices;

        // Remove controller from all it's connected devices.
        if (networkDevices) {
            const devices = networkDevices.map(deviceLink => NetworkDeviceFlow.resolveLink(deviceLink))
            for (const device of devices) {
                if (device) await device.update({'data.technology.networkController': ''});
            }
        }

        // Clear devices of the controller.
        await controller.update({'data.networkDevices': []});
    }

    static getNetworkDevices(controller: SR5Item): SR5Item[] {
        const devices: SR5Item[] = [];
        const controllerData = controller.asControllerData();
        if (!controllerData) return devices;

        controllerData.data.networkDevices.forEach(link => {
            const device = NetworkDeviceFlow.resolveLink(link);
            if (device) devices.push(device);
        });

        return devices;
    }
}