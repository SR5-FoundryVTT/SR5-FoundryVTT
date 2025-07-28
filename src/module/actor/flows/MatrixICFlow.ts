import { SR5Item } from "../../item/SR5Item";
import { SR5Actor } from "../SR5Actor";

/**
 * Handle IC actor behavior and data.
 */
export const MatrixICFlow = {
    /**
     * Connect an IC actor to a host and handle attribute transfer. 
     * 
     * The network connection itself is handled by MatrixNetworkFlow.addSlave!
     * 
     * @param host Host to connect to.
     * @param ic IC to connect to host with.
     */
    async connectToHost(host: SR5Item, ic: SR5Actor) {
        // Allow call to drop out gracefully.
        if (!ic.isType('ic')) return;
        // TODO: foundry-vtt-types v9
        const hostData = host.asType('host');
        if (!hostData) return;

        // Allow local value calculation and data preparation to work without the host item prepared.
        const updateData = {
            rating: hostData.system.rating < 0 ? 0 : hostData.system.rating,
            atts: foundry.utils.duplicate(hostData.system.atts)
        }

        await ic.update({ system: { host: updateData } });
    },

    /**
     * A host has been disconnected from the IC actor.
     * 
     * This means we have to cleanup some data on the IC actor.
     * 
     * NOTE: It is assumed that only GMs update IC actors...
     * 
     * @param ic The disconnected IC actor.
     */
    async disconnectFromHost(ic: SR5Actor) {
        // Graceful exit if not an IC actor.
        if (!ic.isType('ic')) return;

        // Fully reset rating and attributes, to allow users to edit the them using the IC actor sheet.
        const updateData = {
            id: null,
            rating: 0,
            atts: null
        }

        await ic.update({ system: { host: updateData } });
    },

    /**
     * Hanle an updateItem hook for host items.
     * 
     * TODO: This can be reworked using SR5Actor.getRollData() to retrieve host attributes.
     * 
     * @param host The host updated.
     */
    async handleUpdateItemHost(host: SR5Item) {
        if (!canvas.ready || !game.actors) return;

        if (!host.isType('host')) return;
        // Collect actors from sidebar and active scene to update / rerender
        const connectedIC = [
            // All sidebar actors should also include tokens with linked actors.
            ...(game.actors as unknown as SR5Actor[]).filter(actor => actor.isType('ic') && actor.hasHost()) as SR5Actor<'ic'>[],
            // All token actors that aren't linked.
            // @ts-expect-error // TODO: foundry-vtt-types v10
            ...canvas.scene.tokens.filter(token => !token.actorLink && token.actor?.isType('ic') && token.actor?.hasHost()).map(t => t.actor)
        ];

        // Update host data on the ic actor.
        for (const ic of connectedIC) {
            if (!ic) continue;
            await MatrixICFlow.updateFromHost(host, ic);
        }
    },

    /**
     * An update has been made to the connected host, update all IC data.
     * 
     * @param host Host to retrieve data from.
     * @param ic IC actor to update.
     */
    async updateFromHost(host: SR5Item, ic: SR5Actor) {
        // Allow call to drop out gracefully.
        if (!ic.isType('ic')) return;
        // TODO: foundry-vtt-types v9
        const hostData = host.asType('host');
        if (!hostData) return;

        const updateData = {
            rating: hostData.system.rating,
            atts: foundry.utils.duplicate(hostData.system.atts)
        }

        // Some host data isn't stored on the IC actor (marks) and won't cause an automatic render.
        await ic.update({ system: { host: updateData } }, { render: false });
        await ic.sheet?.render();
    },
}
