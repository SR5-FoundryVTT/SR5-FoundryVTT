import { SR5Actor } from "../../actor/SR5Actor";
import { SR5Item } from "../SR5Item";
import { NetworkStorage } from "../../storage/NetworkStorage";
import { Helpers } from "../../helpers";
import { SocketMessage } from "../../sockets";
import { FLAGS, SYSTEM_NAME } from "../../constants";
import { Translation } from "@/module/utils/strings";

/**
 * This flow handles everything involving how matrix devices are connected to network and what
 * device is the master of such a network.
 *
 * It doesn't include rule handling, nor does it handle other matrix functionality.
 * 
 * In general connection details are stored using DataStorage, allowing us to avoid syncing issues with
 * master / slave documents both having uuid references to each other.
 */
export class MatrixNetworkFlow {
    /**
     * Abstract away Foundry uuid system to allow for further implementation changes and typing restrictions.
     *
     * @param target Whatever Document you want to link to.
     */
    static buildLink(target: SR5Actor | SR5Item | TokenDocument) {
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

        return fromUuidSync(link) as SR5Actor | SR5Item | undefined;
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
    static async addSlave(master: SR5Item, slave: SR5Actor | SR5Item) {
        console.debug(`Shadowrun5e | Adding document ${slave?.name} to the master ${master?.name}`, master, slave);
        if (!master || !slave) return console.error('Shadowrun 5e | Either the networks master or device did not resolve.');

        if (!MatrixNetworkFlow.validateSlave(master, slave)) return;
        if (NetworkStorage.isSlave(master, slave)) return;

        await NetworkStorage.addSlave(master, slave, true);

        console.debug(`Shadowrun5e | Added document ${slave?.name} to the master ${master?.name}`, master, slave);

        await MatrixNetworkFlow._triggerUpdateForNetworkConnectionChange(master, slave);

        if (slave instanceof SR5Actor && master.isType('grid')) {
            await MatrixNetworkFlow.storeLastUsedGrid(slave, master);
        }
    }

    /**
    * Determine if the given master and slave can be in a network relationship.

    * @param master The network controller or master.
    * @param slave The network icon or slave.
    * @returns true, if the slave can be added to the master.
    */
    static validateSlave(master: SR5Item, slave: SR5Actor | SR5Item) {
        // Disallow direct circular relationship.
        if (master.id === slave.id) {
            console.warn('Shadowrun 5e | A device cant be its own network master');
            return false;
        }

        // Validate PAN relationsships.
        if (master.isType('device') && !slave.canBeSlave) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.CantConnectToPAN'));
            return false;
        }

        // Validate WAN relationships.
        if (master.isNetwork() && !slave.canBeMatrixIcon) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.CantConnectToWAN'));
            return false;
        }

        // Validate IC to master relationships.
        if (slave instanceof SR5Actor && master.isType('grid') && slave.isType('ic')) {
            ui.notifications?.error(game.i18n.localize('SR5.Errors.CantConnectICToGrid'));
            return false;
        }

        return true;
    }

    /**
     * This method is removing a device from the master devices list. It doesn't remove the master reference itself.

     * @param slave A network device that's connected to a master.
     */
    static async removeSlaveFromMaster(slave: SR5Actor | SR5Item | undefined) {
        console.debug(`Shadowrun 5e | Removing device ${slave?.name} from its master`);

        if (!slave) return;
        if (!slave.canBeSlave) return;

        // We remove slave from network, even if master shouldn't exist anymore.
        await NetworkStorage.removeFromNetworks(slave);

        // Retrieve master to update it's sheet.
        const master = MatrixNetworkFlow.getMaster(slave);
        if (!master)
            return console.error(`Shadowrun 5e | Could not find master for device ${slave.name}`);

        await MatrixNetworkFlow._triggerUpdateForNetworkConnectionChange(master, slave);
    }

    /**
     * Remove a single device (given as a link) from a masters network and disconnect the device from the master.
     *
     * NOTE: We don´t validate master and slaves, so any wrongfully connected master/slave network can be removed.
     *
     * @param master The master device that's connected to the slave.
     * @param slave The matrix icon to be disconnected.
     */
    static async removeSlave(master: SR5Item, slave: SR5Actor | SR5Item) {
        console.debug(`Shadowrun 5e | Removing device with uuid ${slave.uuid} from network`);

        await NetworkStorage.removeSlave(master, slave);

        await MatrixNetworkFlow._triggerUpdateForNetworkConnectionChange(master, slave);
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

        const slaves = NetworkStorage.getSlaves(master);
        await NetworkStorage.removeSlaves(master);

        // Since no document update occured, we have to trigger a update for cross session sheet re-render.
        await master.update({system: {matrix: {updatedConnections: Date.now()}}});
        for (const slave of slaves)
            await slave.update({system: {matrix: {updatedConnections: Date.now()}}});
    }

    /**
     * Return all network devices connected to a master.
     *
     * @param master The master device to retrieve slaves for.
     * @returns A list of network devices slaved to the master.
     */
    static getSlaves(master: SR5Item): (SR5Actor | SR5Item)[] {
        console.debug(`Shadowrun 5e | Getting slaves for master ${master.name}`, master);

        if (!master.canBeMaster) {
            console.error(`Shadowrun 5e | Item ${master.name} can not be a network master`);
            return [];
        };
        const slaves = NetworkStorage.getSlaves(master);

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
    static async handleOnDeleteDocument(document: SR5Actor | SR5Item, data: any, id: string) {
        console.debug(`Shadowrun 5e | Checking for network on deleted item ${document.name}`, document);
        // A deleted master must be removed from all its devices.
        if (document instanceof SR5Item && document.canBeMaster) return MatrixNetworkFlow.removeAllSlaves(document);
        // A deleted device must be removed from its master.
        if (document.canBeMatrixIcon) return MatrixNetworkFlow.disconnectNetwork(document);
    }

    static _currentUserCanModifyDevice(device: SR5Actor | SR5Item): boolean {
        return game.user?.isGM || device.isOwner;
    }

    /**
     * Disconnect the given actor from the network.
     *
     * @param slave This matrix icon will be disconnected from it's network.
     */
    static async disconnectNetwork(slave: SR5Actor | SR5Item) {
        const master = MatrixNetworkFlow.getMaster(slave);
        await NetworkStorage.removeFromNetworks(slave);
        await MatrixNetworkFlow._triggerUpdateForNetworkConnectionChange(master, slave);

        // Reconnect to previously used grid, if any.
        if (slave instanceof SR5Item || !(master instanceof SR5Item)) return;
        await MatrixNetworkFlow.reconnectToLastGrid(slave, master);
    }

    /**
     * Reconnect a matrix actor to its last used grid after disconnecting from a host.
     * 
     * Apply SR5#239 'Enter/Exit Host' reconnect to last grid.
     * 
     * @param slave The matrix actor to reconnect.
     * @param master The item (typically a host) the actor is being disconnected from.
     */
    static async reconnectToLastGrid(slave: SR5Actor, master: SR5Item) {
        // Let users disconnect from grids only.
        if (!master.isNetwork() || !master.isType('host')) return;
        // Disallow non-matrix actors from reconnecting
        if (!slave.isMatrixActor) return;

        const matrixData = slave.matrixData();
        if (!matrixData?.grid.uuid) return;

        const grid = foundry.utils.fromUuidSync(matrixData.grid.uuid) as SR5Item<'grid'> | undefined;
        if (!grid || !grid.isType('grid')) return;
        await NetworkStorage.addSlave(grid, slave);
    }

    /**
     * Determine if the given device is connected to any network
     *
     * @param slave A matrix network device.
     * @returns true, if the device is connected to a network.
     */
    static isSlave(slave: SR5Actor | SR5Item) {
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
    static getMaster(slave: SR5Actor | SR5Item): SR5Item | null {
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

    /**
     * Collect all grids.
     *
     * @param options.players If true, only grids visible to players are returned.
     */
    static getGrids(options = {players: true}): SR5Item[] {
        const grids = (game.items as unknown as SR5Item[]).filter(item => item.isType('grid'));
        if (options.players) return grids.filter(grid => grid.matrixIconVisibleToPlayer());
        return grids;
    }

    /**
     * Collect all networks.
     *
     * @param options.players If true, only networks visible to players are returned.
     */
    static getNetworks(options = {players: false}): SR5Item[] {
        const networks = (game.items as unknown as SR5Item[]).filter(item => item.isNetwork()) ?? [];
        if (options.players) return networks.filter(network => network.matrixIconVisibleToPlayer());
        return networks;
    }

    /**
     * Collect networks to select based on GRIDs on character.
     * 
     * @param character Collect networks based on this character.
     */
    static getNetworksForCharacter(character: SR5Actor) {
        const networks: SR5Item[] = [];

        // Use collect list of SINs on character to retrieve all networks character has access to.
        for (const sin of character.itemTypes.sin) {
            if (!sin.system.networks) continue;
            for (const uuid of sin.system.networks) {
                const network = fromUuidSync(uuid) as SR5Item | undefined;
                if (!network) {
                    console.error(`Shadowrun 5e | Network with uuid ${uuid} in character ${character.name} SIN items not found anymore.`);
                    continue;
                }

                networks.push(network);
            }
        }

        // TODO: Add public GRIDs

        return networks;
    }

    /**
     * Helper function to update both a master and slave connection. 
     * We have to do this, as the network connection is stored in DataStorage, which doesn't update the documents involved,
     * and therefore not causing a sheet.render. Instead we cause an otherwise unnecessary document update to trigger a sheet.render 
     * across all active user sessions using that document sheet.
     * 
     * @param master The network master to update.
     * @param slave The network slave to update.
     */
    static async _triggerUpdateForNetworkConnectionChange(master: SR5Item | undefined | null, slave: SR5Actor | SR5Item | undefined | null) {
        const updateData = { system: { matrix: { updatedConnections: Date.now() } } };

        // Players will trigger this workflow as well and likely can't update one of the documents.
        if (game.user?.isGM) {
            // Duplicate data, as update will inject id and type fields into it after the first call...
            if (slave) await slave.update(foundry.utils.duplicate(updateData));
            if (master) await master.update(foundry.utils.duplicate(updateData));
        }
        else {
            const documentsData: {uuid: string, updateData: any}[] = [];
            if (slave) documentsData.push({uuid: slave.uuid, updateData});
            if (master) documentsData.push({uuid: master.uuid, updateData});
            if (documentsData) await this._triggerUpdatesAsGM(documentsData);
        }
    }

    /**
     * Trigger update using GM session for documents to connect / disconnect network devices.
     * 
     * @param documentsData A list of objects containing the uuid and update data for each.
     */
    static async _triggerUpdatesAsGM(documentsData: {uuid: string, updateData: any}[]) {
        await SocketMessage.emitForGM(FLAGS.UpdateDocumentsAsGM, documentsData);
    }

    /**
     * Trigger a ChatMessage informing everyone about player intention to invite placing mark for a network connection.
     * 
     * This will allow the GM to accept this invitation.
     */
    static async AskForNetworkMarkInvite(actor: SR5Actor, target: SR5Actor | SR5Item) {
        if (!actor || !target) {
            console.error('Shadowrun 5e | No actor or target given for network mark invite.');
            return;
        }

        const content = await renderTemplate('systems/shadowrun5e/dist/templates/chat/matrix-network-mark-invite.hbs', {
            target
        });

        const messageData = {
            content,
            speaker: ChatMessage.getSpeaker({actor}),
            type: 'base',
            flags: {
                [`${SYSTEM_NAME}.${FLAGS.MatrixNetworkMarkInvite}`]: {
                    actorUuid: actor.uuid,
                    targetUuid: target.uuid,
                }
            }
        } satisfies ChatMessage.CreateData;

        await ChatMessage.create(messageData);
    }

    /**
     * After GM accepts the Matrix Network Mark Invite via Chat message, this will place the mark and acknowledge the invite.
     *
     * @param event User clicking on button in chat message.
     */
    static async acknowledgeMarkInvite(event) {
        event.preventDefault();
        event.stopPropagation();

        // Disallow players to accept, even if they have permissions.
        // This is doneto avoid permission checks on all involved documents.
        if (!game.user?.isGM)
            return ui.notifications.warn('SR5.Warnings.OnlyGMCanDoThis', {localize: true});


        // Collect necessary data from chat message.
        const element = event.currentTarget.closest('.chat-message');
        const messageId = element.dataset.messageId;
        const message = game.messages?.get(messageId);
        if (!message) return;

        const {actorUuid, targetUuid} = message.getFlag(SYSTEM_NAME, FLAGS.MatrixNetworkMarkInvite);

        const actor = await fromUuid(actorUuid) as SR5Actor | undefined;
        const network = await fromUuid(targetUuid) as SR5Item | undefined;

        if (!actor || !network)
            return console.error('Shadowrun 5e | Could not resolve actor or network for mark invite', actorUuid, targetUuid);


        // Do nothing, if enough marks are already placed.
        const marks = actor.getMarksPlaced(network.uuid);
        if (marks > 0)
            return ui.notifications.warn(game.i18n.format('SR5.Warnings.AlreadyJoinedNetwork', {name: actor.name}));
        // Only mark, don't connect. Not all players want to immediately connect to the network.
        await actor.setMarks(network, 1);


        // Inform Players about accepted mark invite.
        const messageData = {
            content: game.i18n.format('SR5.Messages.MarkInvitation.InviteAccepted', {networkName: network.name, userName: actor.name}),
            speaker: ChatMessage.getSpeaker({actor}),
            type: 'base'
        } satisfies ChatMessage.CreateData;
        await ChatMessage.create(messageData);
    }

    static async chatMessageListeners(message: ChatMessage, html, data) {
        $(html).find('.button[data-action="matrix-network-mark-invite"]').on('click', MatrixNetworkFlow.acknowledgeMarkInvite.bind(this));
    }

    /**
     * Collect visible hosts for selection.
     */
    static visibleHosts() {
        return (game.items as unknown as SR5Item[])?.filter(item => item.isType('host') && item.matrixIconVisibleToPlayer()) ?? [];
    }

    /**
     * Collect all hosts for selection.
     */
    static allHosts() {
        return (game.items as unknown as SR5Item[])?.filter(item => item.isType('host')) ?? [];
    }

    /**
     * Collect visible grids for selection.
     */
    static visibleGrids() {
        return (game.items as unknown as SR5Item[])?.filter(item => item.isType('grid') && item.matrixIconVisibleToPlayer()) ?? [];
    }

    /**
     * Collect all grids for selection.
     */
    static allGrids() {
        return (game.items as unknown as SR5Item[])?.filter(item => item.isType('grid')) ?? [];
    }

    /**
     * Store grid uuid on new connection to allow reconnecting to
     * - reconnect to last grid on host disconnect
     * - have a reference for checking for public grids within a host if necessary
     * 
     * See SR5#239 'Enter/Exit Host'
     */
    static async storeLastUsedGrid(actor: SR5Actor, network: SR5Item<'grid'>) {
        if (actor.isType('ic')) return;
        if (!network.isType('grid')) return;
        await actor.update({system: {matrix: {grid: {uuid: network.uuid}}}});
    }

    /**
     * Transform the given document to a string type for sheet display.
     *
     * NOTE: This function is part of sheet rendering, so we fail silently, to not break sheet rendering.
     * 
     * @param document Any markable document
     * @returns A translation key to be translated.
     */
    static getDocumentType(document: SR5Actor | SR5Item): Translation {
        const isActor = document instanceof SR5Actor;
        const isItem = document instanceof SR5Item;
        if (isItem && document.type === 'host') return 'SR5.ItemTypes.Host';
        if (isItem && document.type === 'grid') return 'SR5.ItemTypes.Grid';
        if (isItem) return 'SR5.Device';

        if (isActor && document.type === 'ic') return 'SR5.ActorTypes.IC';
        if (isActor && document.type === 'vehicle') return 'SR5.ActorTypes.Vehicle';

        if (isActor && !document.hasPersona) return 'SR5.Labels.ActorSheet.Offline';
        return 'SR5.Labels.ActorSheet.Persona';
    }
}
