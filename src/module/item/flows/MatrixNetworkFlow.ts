import { SR5Actor } from "../../actor/SR5Actor";
import { SR5Item } from "../SR5Item";
import { SocketMessage } from "../../sockets";
import { FLAGS } from "../../constants";
import { NetworkStorage } from "../../storage/NetworkStorage";
import { Helpers } from "../../helpers";

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
    static buildLink(target: Shadowrun.NetworkDevice | TokenDocument) {
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

        return fromUuidSync(link) as Shadowrun.NetworkDevice | undefined;
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
        console.debug('Shadowrun 5e | Handle add master socket message', message);
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
    static async addSlave(master: SR5Item, slave: Shadowrun.NetworkDevice) {
        console.debug(`Shadowrun5e | Adding document ${slave?.name} to the master ${master?.name}`, master, slave);
        if (!master || !slave) return console.error('Shadowrun 5e | Either the networks master or device did not resolve.');

        if (!MatrixNetworkFlow.validateSlave(master, slave)) return;
        if (NetworkStorage.isSlave(master, slave)) return;

        await NetworkStorage.addSlave(master, slave, true);

        console.debug(`Shadowrun5e | Added document ${slave?.name} to the master ${master?.name}`, master, slave);

        // Since no document update occures, we have to trigger a re-render.
        slave.sheet?.render();
        master.sheet?.render();
    }

    /**
    * Determine if the given master and slave can be in a network relationship.

    * @param master The network controller or master.
    * @param slave The network icon or slave.
    * @returns true, if the slave can be added to the master.
    */
    static validateSlave(master: SR5Item, slave: Shadowrun.NetworkDevice) {
        // Disallow direct circular relationship.
        if (master.id === slave.id) {
            console.warn('Shadowrun 5e | A device cant be its own network master');
            return false;
        }

        // Validate PAN relationsships.
        if (master.isDevice && !slave.canBeSlave) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.CantConnectToPAN'));
            return false;
        }

        // Validate WAN relationships.
        if (master.isNetwork && !slave.canBeMatrixIcon) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.CantConnectToWAN'));
            return false;
        }

        return true;
    }

    /**
     * Handle everything around adding a slave to a master, including removing it from already connected networks.
     *
     * Note: This method needs GM access
     *
     * @param master
     * @param slave
     */
    private static async _handleAddSlaveToNetwork(master: SR5Item, slave: Shadowrun.NetworkDevice): Promise<undefined> {
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
    static async removeSlaveFromMaster(slave: Shadowrun.NetworkDevice | undefined) {
        console.debug(`Shadowrun 5e | Removing device ${slave.name} from its master`);

        if (!slave) return;
        if (!slave.canBeSlave) return;

        // Retrieve master to update it's sheet.
        const master = MatrixNetworkFlow.getMaster(slave);

        // We clean this device from all networks, to clean up any issues.
        await NetworkStorage.removeFromNetworks(slave);

        // Since no document update occures, we have to trigger a re-render.
        master?.sheet?.render();
        slave.sheet?.render();
    }

    /**
     * Remove a single device (given as a link) from a masters network and disconnect the device from the master.
     *
     * NOTE: We don´t validate master and slaves, so any wrongfully connected master/slave network can be removed.
     *
     * @param master The master device that's connected to the slave.
     * @param slave The matrix icon to be disconnected.
     */
    static async removeSlave(master: SR5Item, slave: Shadowrun.NetworkDevice) {
        console.debug(`Shadowrun 5e | Removing device with uuid ${slave.uuid} from network`);

        await NetworkStorage.removeSlave(master, slave);

        // Since no document update occures, we have to trigger a re-render.
        slave.sheet?.render();
        master.sheet?.render();
    }

    /**
     * Clear a masters network, disconnecting it's devices from the master
     * from it's devices.
     *
     * NOTE: We don´t validate master and slaves, so any wrongfully connected master/slave network can be removed.
     *
     * @param master
     */
    static async removeAllSlaves(master: SR5Item) {
        console.debug(`Shadowrun 5e | Removing all devices from network ${master.name}`);

        const slaves = await NetworkStorage.getSlaves(master);
        await NetworkStorage.removeSlaves(master);

        // Since no document update occures, we have to trigger a re-render.
        master.sheet?.render();
        slaves.forEach(slave => slave.sheet?.render());
    }

    private static async _setMasterFromLink(slave: Shadowrun.NetworkDevice, masterLink: string) {
        if (!slave.canBeSlave) return console.error('Shadowrun 5e | Given device cant be part of a network', slave);
        await slave.setMasterUuid(masterLink);
    }

    private static async _setSlavesOnMaster(master: SR5Item, deviceLinks: string[]) {
        if (!master.canBeMaster) return console.error('Shadowrun 5e | Given device cant control a network', master);
        await master.update({ 'system.slaves': deviceLinks });
    }

    /**
     * As part of the deleteItem FoundryVTT event this method will be called by all active users, even if they lack permission.
     * @param slave The device that is to be removed from the network master.
     * @private
     */
    private static async _removeSlaveFromNetwork(slave: Shadowrun.NetworkDevice) {
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
     * Return all network devices connected to a master.
     *
     * @param master The master device to retrieve slaves for.
     * @returns A list of network devices slaved to the master.
     */
    static async getSlaves(master: SR5Item): Promise<Shadowrun.NetworkDevice[]> {
        console.debug(`Shadowrun 5e | Getting slaves for master ${master.name}`, master);

        if (!master.canBeMaster) {
            console.error(`Shadowrun 5e | Item ${master.name} can not be a network master`);
            return [];
        };
        const slaves = await NetworkStorage.getSlaves(master);

        console.debug(`Shadowrun 5e | Found ${slaves.length} slaves for master ${master.name}`, slaves);

        return slaves;
    }

    /**
     * Note: This handler will be called for all active users, even if they lack permission to alter item data.
     *       This can result in lingering network devices or masters, when no GM or device owner is active.
     *
     * @param document This can be a network master or device or neither.
     * @param data The document data given by FoundryVTT deleteItem event
     * @param id The document id
     */
    static async handleOnDeleteDocument(document: Shadowrun.NetworkDevice, data: any, id: string) {
        console.debug(`Shadowrun 5e | Checking for network on deleted item ${document.name}`, document);
        // A deleted master must be removed from all its devices.
        if (document.canBeMaster) return await MatrixNetworkFlow.removeAllSlaves(document);
        // A deleted device must be removed from its master.
        if (document.canBeMatrixIcon) return await MatrixNetworkFlow.disconnectNetwork(document);
    }

    static _currentUserCanModifyDevice(device: Shadowrun.NetworkDevice): boolean {
        return game.user?.isGM || device.isOwner;
    }

    /**
     * Disconnect the given actor from the network.
     * 
     * @param slave This matrix icon will be disconnected from it's network.
     */
    static async disconnectNetwork(slave: Shadowrun.NetworkDevice) {
        const master = MatrixNetworkFlow.getMaster(slave);
        await NetworkStorage.removeFromNetworks(slave);

        // Since documents arent updated, re-render related sheets.
        slave.sheet?.render();
        master?.sheet?.render();
    }

    /**
     * Determine if the given device is connected to any network
     * 
     * @param slave A matrix network device.
     * @returns true, if the device is connected to a network.
     */
    static isSlave(slave: Shadowrun.NetworkDevice) {
        const networks = NetworkStorage.getStorage();
        const slaveUuid = Helpers.uuidForStorage(slave.uuid);
        for (const slaves of Object.values(networks)) {
            if (slaves.includes(slaveUuid)) return true;
        }
        return false;
    }

    /**
     * Retrieve the master of a given network device.
     */
    static getMaster(slave: Shadowrun.NetworkDevice): SR5Item | null {
        // Validate actor icons.
        if (slave instanceof SR5Actor) {
            if (!slave.isMatrixActor) {
                console.error('Shadowrun 5e | Actor is not a matrix actor', slave);
                return null;
            };
        }

        // Validate item icons.
        if (slave instanceof SR5Item) {
            if (!slave.isMatrixDevice) {
                console.error('Shadowrun 5e | Item is not a matrix device', slave);
                return null;
            }
        }

        return NetworkStorage.getMaster(slave);
    }
}
