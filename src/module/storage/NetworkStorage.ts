import { SR5Actor } from "../actor/SR5Actor";
import { DataStorage } from "../data/DataStorage";
import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";

/**
 * Storage Matrix network relations.
 * Either master/slave PAM relations or host WAN relations.
 *
 * networks: {
 *    [uuid of network document]: [uuid of slave/ic/device, ...]
 */
export const NetworkStorage = {
    key: 'matrix.networks' as const,

    /**
     * Add a slave to a masters network.
     *
     * This terminology is used for both PAN and WAN networks.
     *
     * @param master The master network document.
     * @param slave A network icon document.
     * @param removeFromOthers When true, the slave will be removed from all other networks.
     */
    async addSlave(master: SR5Item, slave: SR5Actor | SR5Item, removeFromOthers: boolean = false) {
        const networks = NetworkStorage.getStorage();
        const masterUuid = Helpers.uuidForStorage(master.uuid);
        const slaveUuid = Helpers.uuidForStorage(slave.uuid);

        if (!networks[masterUuid]) {
            networks[masterUuid] = [];
        }

        if (removeFromOthers) {
            for (const [uuid, slaves] of Object.entries(networks)) {
                if (uuid === masterUuid) {
                    continue;
                }

                networks[uuid] = slaves.filter(uuid => uuid !== slaveUuid);
            }
        }

        if (!networks[masterUuid].includes(slaveUuid)) {
            networks[masterUuid].push(slaveUuid);
        }

        await DataStorage.set(NetworkStorage.key, networks);
    },

    /**
     * Remove a slave from a masters network.
     *
     * This terminology is used for both PAN and WAN networks.
     *
     * @param master The master network document.
     * @param slave A network icon document.
     */
    async removeSlave(master: SR5Item, slave: SR5Actor | SR5Item) {
        const networks = NetworkStorage.getStorage();
        const masterUuid = Helpers.uuidForStorage(master.uuid);
        const slaveUuid = Helpers.uuidForStorage(slave.uuid);

        if (!networks[masterUuid]) {
            return;
        }

        networks[masterUuid] = networks[masterUuid].filter(uuid => uuid !== slaveUuid);
        await DataStorage.set(NetworkStorage.key, networks);
    },

    /**
     * Remove given slave from all networks in storage.
     *
     * @param slave A network icon document.
     */
    async removeFromNetworks(slave: SR5Actor | SR5Item) {
        const networks = NetworkStorage.getStorage();
        const slaveUuid = Helpers.uuidForStorage(slave.uuid);

        for (const [uuid, slaves] of Object.entries(networks)) {
            networks[uuid] = slaves.filter(uuid => uuid !== slaveUuid);
        }

        await DataStorage.set(NetworkStorage.key, networks);
    },

    /**
     * Checks if given slave is part of a master network.
     *
     * NOTE: If there is no master network, this will return false.
     *
     * @param master The master network document.
     * @param slave A network icon document.
     * @returns true, when slave is part of a master network.
     */
    isSlave(master: SR5Item, slave: SR5Actor | SR5Item): boolean {
        const networks = NetworkStorage.getStorage();
        const masterUuid = Helpers.uuidForStorage(master.uuid);
        const slaveUuid = Helpers.uuidForStorage(slave.uuid);
        return networks[masterUuid]?.includes(slaveUuid) ?? false;
    },

    /**
     * Remove all slaves from a specific master network.
     * @param master The master network document.
     */
    async removeSlaves(master: SR5Item) {
        const networks = NetworkStorage.getStorage();
        const masterUuid = Helpers.uuidForStorage(master.uuid);
        delete networks[masterUuid];
        await DataStorage.set(NetworkStorage.key, networks);
    },

    /**
     * Retrieve all slaves for a given master network.
     *
     * NOTE: While this method is async, it does not perform any async operations.
     *       This allows future async operations without API change.
     *
     * @returns An array of network icon documents.
     */
    getSlaves(master: SR5Item) {
        const networks = NetworkStorage.getStorage();
        const masterUuid = Helpers.uuidForStorage(master.uuid);
        const slaveUuids = networks[masterUuid] ?? [];
        const slaves = [] as (SR5Actor | SR5Item)[];
        for (const uuid of slaveUuids) {
            const item = fromUuidSync(Helpers.uuidFromStorage(uuid));
            // in case we have a stale id in storage, only add valid items
            if (item) {
                slaves.push(item as (SR5Actor | SR5Item));
            } else {
                console.warn(`Could not find item from id ${uuid}. Consider clearing all Networked Items for ${master?.name}`)
            }
        }
        return slaves;
    },

    /**
     * Retrieve the master of a given slave matrix icon.
     *
     * @param slave Slave network icon document.
     * @returns The master network document or null if not found.
     */
    getMaster(slave: SR5Actor | SR5Item): SR5Item | null {
        const networks = NetworkStorage.getStorage();
        const slaveUuid = Helpers.uuidForStorage(slave.uuid);

        for (const [uuid, slaves] of Object.entries(networks)) {
            if (slaves.includes(slaveUuid)) {
                return fromUuidSync(Helpers.uuidFromStorage(uuid)) as SR5Item;
            }
        }

        // if we did not find the master in the NetworkStorage, try to load it from the uuid we have stored
        const masterUuid = slave.getMasterUuid();
        if (masterUuid) return fromUuidSync(masterUuid) as SR5Item | null;

        return null;
    },

    /**
     * Remove all network relations.
     *
     * WARNING: This will remove all PAN and WAN relations.
     */
    async removeAllNetworks() {
        await DataStorage.set(NetworkStorage.key, {});
    },

    /**
     * @returns The complete network storage.
     */
    getStorage(): Shadowrun.Storage['matrix']['networks'] {
        return DataStorage.get(NetworkStorage.key) ?? {};
    }
}
