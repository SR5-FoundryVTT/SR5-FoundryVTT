import { SR5Actor } from "../../actor/SR5Actor";
import { SR5Item } from "../SR5Item";
import { SocketMessage } from "../../sockets";
import { FLAGS } from "../../constants";

/**
 * Any document that can be part of a matrix network
 * - SR5Item => Equipment / Device
 * - SR5Actor => Vehicle
 */
export type NetworkDevice = SR5Actor | SR5Item;
/**
 * This flow handles everything involving how matrix devices are connected to network and what
 * device is the master of such a network.
 * 
 * It doesn't include rule handling, nor does it handle other matrix functionality.
 */
export class MatrixNetworkFlow {
    /**
     * Abstract away Foundry uuid system to allow for further implementation changes and typing restrictions.
     *
     * @param target Whatever Document you want to link to.
     */
    static buildLink(target: NetworkDevice | TokenDocument) {
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

        return fromUuidSync(link) as NetworkDevice | undefined;
    }

    static async emitAddMasterSocketMessage(master: SR5Item, slaveLink: string) {
        const masterLink = MatrixNetworkFlow.buildLink(master);

        await SocketMessage.emitForGM(FLAGS.addNetworkMaster, { masterLink, slaveLink });
    }

    /**
     * Handle socket messages adding a device to the device list of network
     * @param message
     */
    static async _handleAddMasterSocketMessage(message: Shadowrun.SocketAddMasterMessageData) {
        console.log('Shadowrun 5e | Handle add master socket message', message);
        if (!game.user?.isGM) return console.error(`Shadowrun 5e | Abort handling of message. Current user isn't a GM`, game.user);

        const master = MatrixNetworkFlow.resolveItemLink(message.data.masterLink);
        const slave = MatrixNetworkFlow.resolveLink(message.data.slaveLink);

        if (!master || !slave) return console.error('Shadowrun 5e | Either the networks master or device did not resolve.');

        await MatrixNetworkFlow._handleAddSlaveToNetwork(master, slave);
    }

    /**
     * Connect a device to a network master.
     *
     * A network master is the device managing the PAN/WAN.
     * A network device is to be added to the network managed by the master.
     *
     * @param master
     * @param slave
     */
    static async addSlave(master: SR5Item, slave: NetworkDevice) {
        console.log(`Shadowrun5e | Adding an the item ${slave.name} to the master ${master.name}`, master, slave);
        if (master.id === slave.id) return console.warn('Shadowrun 5e | A device cant be its own network master');
        if (!slave.canBeSlave) return ui.notifications?.error(game.i18n.localize('SR5.Errors.CanOnlyAddTechnologyItemsToANetwork'));
        if (!master.canBeMaster) return;

        if (MatrixNetworkFlow._currentUserCanModifyDevice(master) && MatrixNetworkFlow._currentUserCanModifyDevice(slave))
            await MatrixNetworkFlow._handleAddSlaveToNetwork(master, slave);
        else
            await MatrixNetworkFlow.emitAddMasterSocketMessage(master, slave.uuid);
    }

    /**
     * Handle everything around adding a slave to a master, including removing it from already connected networks.
     *
     * Note: This method needs GM access
     *
     * @param master
     * @param slave
     */
    private static async _handleAddSlaveToNetwork(master: SR5Item, slave: NetworkDevice): Promise<undefined> {
        if (!MatrixNetworkFlow._currentUserCanModifyDevice(master) && !MatrixNetworkFlow._currentUserCanModifyDevice(slave)) { 
            console.error(`User isn't owner or GM of this device`, master);
            return;
        };

        const masterData = master.asDevice || master.asHost;
        if (!masterData) {
            console.error(`Device isn't capable of accepting network devices`, master);
            return;
        }

        const masterUuid = slave.getMasterUuid();

        // Remove device from a network it's already connected to.
        if (masterUuid) await MatrixNetworkFlow._removeSlaveFromNetwork(slave);

        // Add the device to a new master
        const masterLink = MatrixNetworkFlow.buildLink(master);
        await MatrixNetworkFlow._setMasterFromLink(slave, masterLink);

        // Add the device to the list of devices of the master.
        const slaveLink = MatrixNetworkFlow.buildLink(slave);
        const slaves = masterData.system.slaves;
        if (slaves.includes(slaveLink)) return;

        await MatrixNetworkFlow._setSlavesOnMaster(master, [...slaves, slaveLink]);
    }

    /**
     * This method is removing a device from the master devices list. It doesn't remove the master reference itself.

     * @param slave A network device that's connected to a master.
     */
    static async removeSlaveFromMaster(slave: NetworkDevice | undefined) {
        if (!slave) return;

        console.log(`Shadowrun 5e | Removing device ${slave.name} from its master`);

        await MatrixNetworkFlow._removeSlaveFromNetwork(slave);
        await MatrixNetworkFlow._removeMaster(slave);
    }

    /**
     * Remove a single device (given as a link) from a masters network and disconnect the device from the master.
     *
     * @param master
     * @param slaveLink
     */
    static async removeSlaveFromNetwork(master: SR5Item, slaveLink: string) {
        console.log(`Shadowrun 5e | Removing device with uuid ${slaveLink} from network`);
        const masterData = master.asMaster();
        const device = MatrixNetworkFlow.resolveLink(slaveLink);

        // Remove an existing item from the network.
        if (device) {
            const masterUuid = device.getMasterUuid();
            if (masterUuid) await MatrixNetworkFlow._removeMaster(device);
        }

        // Remove the deviceLink from the master.
        if (!masterData) return;
        const deviceLinks = masterData.system.slaves.filter(existingLink => existingLink !== slaveLink);
        await MatrixNetworkFlow._setSlavesOnMaster(master, deviceLinks);
    }


    /**
     * Clear a masters network, disconnecting it's devices from the master
     * from it's devices.
     *
     * @param master
     */
    static async removeAllSlaves(master: SR5Item) {
        console.log(`Shadowrun 5e | Removing all devices from network ${master.name}`);

        await MatrixNetworkFlow._removeMasterFromAllSlaves(master);
        await MatrixNetworkFlow._removeAllSlavesFromMaster(master);
    }

    private static async _setMasterFromLink(slave: NetworkDevice, masterLink: string) {
        if (!slave.canBeSlave) return console.error('Shadowrun 5e | Given device cant be part of a network', slave);
        await slave.setMasterUuid(masterLink);
    }

    /**
     * As part of the deleteItem FoundryVTT event this method will called by all active users, even if they lack permission.
     * @param slave The device to remove a connected master from.
     * @private
     */
    private static async _removeMaster(slave: NetworkDevice) {
        if (!slave.canBeSlave) return console.error('Shadowrun 5e | Given device cant be part of a network', slave);
        if (!MatrixNetworkFlow._currentUserCanModifyDevice(slave)) return;
        await slave.setMasterUuid("");
    }

    private static async _setSlavesOnMaster(master: SR5Item, deviceLinks: string[]) {
        if (!master.canBeMaster) return console.error('Shadowrun 5e | Given device cant control a network', master);
        await master.update({ 'system.slaves': deviceLinks });
    }

    private static async _removeAllSlavesFromMaster(master: SR5Item) {
        if (!master.canBeMaster) return console.error('Shadowrun 5e | Given device cant control a network', master);
        await master.update({ 'system.slaves': [] });
    }

    /**
     * As part of the deleteItem FoundryVTT event this method will be called by all active users, even if they lack permission.
     * @param slave The device that is to be removed from the network master.
     * @private
     */
    private static async _removeSlaveFromNetwork(slave: NetworkDevice) {
        if (!slave.canBeSlave) return console.error('Shadowrun 5e | Given device cant be part of a network', slave);
        const masterUuid = slave.getMasterUuid();
        if (!masterUuid) return;

        // master might not exist anymore.
        const master = MatrixNetworkFlow.resolveItemLink(masterUuid);
        if (!master) return;
        if (!MatrixNetworkFlow._currentUserCanModifyDevice(master)) return;

        const masterData = master.asMaster();
        if (!masterData) return;

        // Remove device from it's master.
        const deviceLink = MatrixNetworkFlow.buildLink(slave);
        const deviceLinks = masterData.system.slaves.filter(existingLink => existingLink !== deviceLink);
        await MatrixNetworkFlow._setSlavesOnMaster(master, deviceLinks);
    }

    /**
     * 
     * @param master 
     * @returns 
     */
    private static async _removeMasterFromAllSlaves(master: SR5Item) {
        if (!master.canBeMaster) return console.error('Shadowrun 5e | Given device cant control a network', master);
        const masterData = master.asMaster();
        if (!masterData) return;

        const slaveLinks = masterData.system.slaves;

        // Remove master from all its connected devices.
        if (slaveLinks) {
            const slaves: (NetworkDevice)[] = [];
            for (const slaveLink of slaveLinks) {
                const slave = MatrixNetworkFlow.resolveLink(slaveLink);
                if (slave) slaves.push(slave);
            }
            for (const slave of slaves) {
                if (!slave) continue;
                await MatrixNetworkFlow._removeMaster(slave);
            }
        }
    }

    /**
     * Return all network devices connected to a master.
     *
     * @param master
     */
    static getSlaves(master: SR5Item) {
        const devices: SR5Item[] = [];
        const masterData = master.asMaster();
        if (!masterData) return devices;

        for (const link of masterData.system.slaves) {
            const device = MatrixNetworkFlow.resolveItemLink(link);
            if (device) devices.push(device);
            else console.warn(`Shadowrun5e | Master ${master.name} has a network device ${link} that doesn't exist anymore`);
        }

        return devices;
    }

    /**
     * Note: This handler will be called for all active users, even if they lack permission to alter item data.
     *       This can result in lingering network devices or masters, when no GM or device owner is active.
     *
     * @param item This can be a network master or device or neither.
     * @param data
     * @param id
     */
    static async handleOnDeleteItem(item: SR5Item, data: Shadowrun.ShadowrunItemDataData, id: string) {
        console.debug(`Shadowrun 5e | Checking for network on deleted item ${item.name}`, item);
        // A deleted master must be removed from all its devices.
        if (item.canBeMaster) return await MatrixNetworkFlow._removeMasterFromAllSlaves(item);
        // A deleted device must be removed from its master.
        if (item.canBeSlave) return await MatrixNetworkFlow._removeSlaveFromNetwork(item);
    }

    static _currentUserCanModifyDevice(device: NetworkDevice): boolean {
        return game.user?.isGM || device.isOwner;
    }

    /**
     * Connect the given actor to the given network item.
     * @param actor This actor will be connected to a network.
     * @param network Must be a host or grid.
     */
    static async connectNetwork(actor: SR5Actor, network: SR5Item) {
        if (!actor.isMatrixActor) return console.error('Shadowrun 5e | Actor is not a matrix actor', actor);
        if (!network.isHost && !network.isGrid) return console.error('Shadowrun 5e | Network is not a host or grid', network);

        await actor.update({ 
            'system.matrix.network.uuid': network.uuid,
            'system.matrix.network.type': network.type
        });
    } 

    /**
     * Disconnect the given actor from the network.
     * @param actor This actor will be connected to a network.
     */
    static async disconnectNetwork(actor: SR5Actor) {
        if (!actor.isMatrixActor) return console.error('Shadowrun 5e | Actor is not a matrix actor', actor);

        await actor.update({
            'system.matrix.network.uuid': "",
            'system.matrix.network.type': ""
        });
    }
}