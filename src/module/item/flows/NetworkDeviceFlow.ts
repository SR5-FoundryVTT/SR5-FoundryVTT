import { SR5Actor } from "../../actor/SR5Actor";
import { SR5Item } from "../SR5Item";
import { SocketMessage } from "../../sockets";
import { FLAGS } from "../../constants";
import SocketAddNetworkControllerMessageData = Shadowrun.SocketAddNetworkControllerMessageData;
import ShadowrunItemDataData = Shadowrun.ShadowrunItemDataData;

export class NetworkDeviceFlow {
    /**
     * Abstract away Foundry uuid system to allow for further implementation changes and typing restrictions.
     *
     * @param target Whatever Document you want to link to.
     */
    static buildLink(target: SR5Item | SR5Actor | TokenDocument) {
        return target.uuid;
    }

    /**
     * Pass-through to resolveLink for cases in which we know it will return an item and not an actor.
     * 
     * @returns Guaranteed SR5Item.
     */
    static resolveItemLink(link: string) {
        const document = this.resolveLink(link);
        if (!(document instanceof SR5Item)) throw new Error(`Document with uuid ${link} is not an item`);
        return document as unknown as SR5Item;
    }

    /**
     * Repacking FoundryVTT fromUuid without async promise to make it usable in sync functions.
     * 
     * NOTE: We're using fromUuidSync instead of fromUuid, to allow Document.getRollData (which is sync).
     *       This way we loose the ability to resolve compendium documents but gain the default Foundry behavior.
     *
     * @param link
     */
    static resolveLink(link: string) {
        if (!link) return;

        return fromUuidSync(link) as SR5Item | SR5Actor | undefined;
    }

    static async emitAddNetworkControllerSocketMessage(controller: SR5Item, networkDeviceLink: string) {
        const controllerLink = NetworkDeviceFlow.buildLink(controller);

        await SocketMessage.emitForGM(FLAGS.addNetworkController, { controllerLink, networkDeviceLink });
    }

    /**
     * Handle socket messages adding a device to the device list of network
     * @param message
     */
    static async _handleAddNetworkControllerSocketMessage(message: SocketAddNetworkControllerMessageData) {
        console.log('Shadowrun 5e | Handle add network controller socket message', message);
        if (!game.user?.isGM) return console.error(`Shadowrun 5e | Abort handling of message. Current user isn't a GM`, game.user);

        const controller = NetworkDeviceFlow.resolveItemLink(message.data.controllerLink);
        const device = NetworkDeviceFlow.resolveLink(message.data.networkDeviceLink);

        if (!controller || !device) return console.error('Shadowrun 5e | Either the networks controller or device did not resolve.');

        await NetworkDeviceFlow._handleAddDeviceToNetwork(controller, device);
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
    static async addDeviceToNetwork(controller: SR5Item, device: SR5Item | SR5Actor) {
        console.log(`Shadowrun5e | Adding an the item ${device.name} to the controller ${controller.name}`, controller, device);
        if (controller.id === device.id) return console.warn('Shadowrun 5e | A device cant be its own network controller');
        if (!device.canBeNetworkDevice) return ui.notifications?.error(game.i18n.localize('SR5.Errors.CanOnlyAddTechnologyItemsToANetwork'));
        if (!controller.canBeNetworkController) return;

        if (NetworkDeviceFlow._currentUserCanModifyDevice(controller) && NetworkDeviceFlow._currentUserCanModifyDevice(device))
            await NetworkDeviceFlow._handleAddDeviceToNetwork(controller, device);
        else
            await NetworkDeviceFlow.emitAddNetworkControllerSocketMessage(controller, device.uuid);
    }

    /**
     * Handle everything around adding a device to a controller, including removing it from already connected networks.
     *
     * Note: This method needs GM access
     *
     * @param controller
     * @param device
     */
    private static async _handleAddDeviceToNetwork(controller: SR5Item, device: SR5Item | SR5Actor): Promise<undefined> {
        if (!NetworkDeviceFlow._currentUserCanModifyDevice(controller) && !NetworkDeviceFlow._currentUserCanModifyDevice(device)) { 
            console.error(`User isn't owner or GM of this device`, controller);
            return;
        };

        const controllerData = controller.asDevice || controller.asHost;
        if (!controllerData) {
            console.error(`Device isn't capable of accepting network devices`, controller);
            return;
        }

        const networkController = device.getNetworkControllerUuid();

        // Remove device from a network it's already connected to.
        if (networkController) await NetworkDeviceFlow._removeDeviceFromController(device);

        // Add the device to a new controller
        const controllerLink = NetworkDeviceFlow.buildLink(controller);
        await NetworkDeviceFlow._setControllerFromLink(device, controllerLink);

        // Add the device to the list of devices of the controller.
        const networkDeviceLink = NetworkDeviceFlow.buildLink(device);
        const networkDevices = controllerData.system.networkDevices;
        if (networkDevices.includes(networkDeviceLink)) return;

        await NetworkDeviceFlow._setDevicesOnController(controller, [...networkDevices, networkDeviceLink]);
    }

    /**
     * This method is removing a device from the controller devices list. It doesn't remove the controller reference itself.

     * @param device A network device that's connected to a controller.
     */
    static async removeDeviceFromController(device: SR5Item | SR5Actor | undefined) {
        if (!device) return;

        console.log(`Shadowrun 5e | Removing device ${device.name} from its controller`);

        await NetworkDeviceFlow._removeDeviceFromController(device);
        await NetworkDeviceFlow._removeControllerFromDevice(device);
    }

    /**
     * Remove a single device (given as a link) from a controllers network and disconnect the device from the controller.
     *
     * @param controller
     * @param deviceLink
     */
    static async removeDeviceLinkFromNetwork(controller: SR5Item, deviceLink: string) {
        console.log(`Shadowrun 5e | Removing device with uuid ${deviceLink} from network`);
        const controllerData = controller.asController();
        const device = NetworkDeviceFlow.resolveLink(deviceLink);

        // Remove an existing item from the network.
        if (device) {
            const networkController = device.getNetworkControllerUuid();
            if (networkController) await NetworkDeviceFlow._removeControllerFromDevice(device);
        }

        // Remove the deviceLink from the controller.
        if (!controllerData) return;
        const deviceLinks = controllerData.system.networkDevices.filter(existingLink => existingLink !== deviceLink);
        await NetworkDeviceFlow._setDevicesOnController(controller, deviceLinks);
    }


    /**
     * Clear a controllers network, disconnecting it's devices from the controller and the controller
     * from it's devices.
     *
     * @param controller
     */
    static async removeAllDevicesFromNetwork(controller: SR5Item) {
        console.log(`Shadowrun 5e | Removing all devices from network ${controller.name}`);

        await NetworkDeviceFlow._removeControllerFromAllDevices(controller);
        await NetworkDeviceFlow._removeAllDevicesFromController(controller);
    }

    private static async _setControllerFromLink(device: SR5Item | SR5Actor, controllerLink: string) {
        if (!device.canBeNetworkDevice) return console.error('Shadowrun 5e | Given device cant be part of a network', device);
        await device.setNetworkControllerUuid(controllerLink);
    }

    /**
     * As part of the deleteItem FoundryVTT event this method will called by all active users, even if they lack permission.
     * @param device The device to remove a connected controller from.
     * @private
     */
    private static async _removeControllerFromDevice(device: SR5Item | SR5Actor) {
        if (!device.canBeNetworkDevice) return console.error('Shadowrun 5e | Given device cant be part of a network', device);
        if (!NetworkDeviceFlow._currentUserCanModifyDevice(device)) return;
        await device.setNetworkControllerUuid("");
    }

    private static async _setDevicesOnController(controller: SR5Item, deviceLinks: string[]) {
        if (!controller.canBeNetworkController) return console.error('Shadowrun 5e | Given device cant control a network', controller);
        await controller.update({ 'data.networkDevices': deviceLinks });
    }

    private static async _removeAllDevicesFromController(controller: SR5Item) {
        if (!controller.canBeNetworkController) return console.error('Shadowrun 5e | Given device cant control a network', controller);
        await controller.update({ 'data.networkDevices': [] });
    }

    /**
     * As part of the deleteItem FoundryVTT event this method will be called by all active users, even if they lack permission.
     * @param device The device that is to be removed from the network controller.
     * @private
     */
    private static async _removeDeviceFromController(device: SR5Item | SR5Actor) {
        if (!device.canBeNetworkDevice) return console.error('Shadowrun 5e | Given device cant be part of a network', device);
        const networkController = device.getNetworkControllerUuid();
        if (!networkController) return;

        // Controller might not exist anymore.
        const controller = NetworkDeviceFlow.resolveItemLink(networkController);
        if (!controller) return;
        if (!NetworkDeviceFlow._currentUserCanModifyDevice(controller)) return;

        const controllerData = controller.asController();
        if (!controllerData) return;

        // Remove device from it's controller.
        const deviceLink = NetworkDeviceFlow.buildLink(device);
        const deviceLinks = controllerData.system.networkDevices.filter(existingLink => existingLink !== deviceLink);
        await NetworkDeviceFlow._setDevicesOnController(controller, deviceLinks);
    }

    private static async _removeControllerFromAllDevices(controller: SR5Item) {
        if (!controller.canBeNetworkController) return console.error('Shadowrun 5e | Given device cant control a network', controller);
        const controllerData = controller.asController();
        if (!controllerData) return;

        const networkDevices = controllerData.system.networkDevices;

        // Remove controller from all its connected devices.
        if (networkDevices) {
            const devices: (SR5Item | SR5Actor)[] = [];
            for (const deviceLink of networkDevices) {
                const device = NetworkDeviceFlow.resolveLink(deviceLink);
                if (device) devices.push(device);
            }
            for (const device of devices) {
                if (!device) continue;
                await NetworkDeviceFlow._removeControllerFromDevice(device);
            }
        }
    }

    /**
     * Return all network devices connected to a controller.
     *
     *
     * @param controller
     */
    static getNetworkDevices(controller: SR5Item) {
        const devices: SR5Item[] = [];
        const controllerData = controller.asController();
        if (!controllerData) return devices;

        for (const link of controllerData.system.networkDevices) {
            const device = NetworkDeviceFlow.resolveItemLink(link);
            if (device) devices.push(device);
            else console.warn(`Shadowrun5e | Controller ${controller.name} has a network device ${link} that doesn't exist anymore`);
        }

        return devices;
    }

    /**
     * Note: This handler will be called for all active users, even if they lack permission to alter item data.
     *       This can result in lingering network devices or controllers, when no GM or device owner is active.
     *
     * @param item This can be a network controller or device or neither.
     * @param data
     * @param id
     */
    static async handleOnDeleteItem(item: SR5Item, data: ShadowrunItemDataData, id: string) {
        console.debug(`Shadowrun 5e | Checking for network on deleted item ${item.name}`, item);
        // A deleted controller must be removed from all its devices.
        if (item.canBeNetworkController) return await NetworkDeviceFlow._removeControllerFromAllDevices(item);
        // A deleted device must be removed from its controller.
        if (item.canBeNetworkDevice) return await NetworkDeviceFlow._removeDeviceFromController(item);
    }

    static _currentUserCanModifyDevice(device: SR5Item | SR5Actor): boolean {
        return game.user?.isGM || device.isOwner;
    }
}