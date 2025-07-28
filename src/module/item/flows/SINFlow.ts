import { SR5Item } from "../SR5Item";

/**
 * Handling of SIN related functionality.
 */
export const SINFlow = {
    /**
     * Retrieve all networks for this sin.
     * @param item A SIN item.
     */
    async getNetworks(item: SR5Item) {
        const sin = item.asType('sin');
        if (!sin) return [];

        const networks: SR5Item[] = [];

        for (const uuid of sin.system.networks) {
            const network = await fromUuid(uuid) as SR5Item;
            if (!network.isType('grid', 'host')) {
                console.error(`SINFlow.getNetworks: Network with uuid ${uuid} is not a grid or host.`);
                continue;
            }
            networks.push(network);
        }
        return networks;
    },

    /**
     * Remove a single network from a SIN item.
     * @param item The SIN item to remove the network from.
     * @param networkUuid The UUID of the network to remove.
     */
    async removeNetwork(item: SR5Item, networkUuid: string) {
        const sin = item.asType('sin');
        if (!sin) return;

        const networks = sin.system.networks.filter(uuid => uuid !== networkUuid);
        await item.update({ system: { networks } });
    }
}
