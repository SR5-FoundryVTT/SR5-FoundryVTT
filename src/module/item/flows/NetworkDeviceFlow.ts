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

        await NetworkDeviceFlow.addNetworkDevice(controller, device);
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
    static async addController(controller: SR5Item, device: SR5Item) {
        if (!(device.isOwner || game.user?.isGM)) return console.error(`User isn't owner or GM of this device`, device);
        if (!controller.isDevice() && !controller.isHost()) return;

        const controllerLink = NetworkDeviceFlow.buildLink(controller);
        await device.update({'data.technology.networkController': controllerLink});

        if (game.user?.isGM)
            await NetworkDeviceFlow.addNetworkDevice(controller, device);
        else
            await NetworkDeviceFlow.emitAddNetworkControllerSocketMessage(controller, device);
    }

    static async addNetworkDevice(controller: SR5Item, device: SR5Item) {
        if (!(controller.isOwner || game.user?.isGM)) return console.error(`User isn't owner or GM of this device`, controller);

        const controllerData = controller.asDeviceData() || controller.asHostData();
        const networkDeviceLink = NetworkDeviceFlow.buildLink(device);

        if (!controllerData) return console.error(`Device isn't capable of accepting network devices`, controller);

        const networkDevices = controllerData.data.networkDevices;
        if (networkDevices.includes(networkDeviceLink)) return;

        await controller.update({'data.networkDevices': [...networkDevices, networkDeviceLink]});
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