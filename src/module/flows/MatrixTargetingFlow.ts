import { SR5Actor } from "../actor/SR5Actor";
import { Helpers } from "../helpers";
import { MatrixNetworkFlow } from "../item/flows/MatrixNetworkFlow";
import MatrixTargetDocument = Shadowrun.MatrixTargetDocument;
import { SR5Item } from '@/module/item/SR5Item';
import { ActorOwnershipFlow } from '@/module/actor/flows/ActorOwnershipFlow';

/**
 * Handles targeting in the matrix.
 */
export const MatrixTargetingFlow = {
    /**
     * Return a list of matrix targets, of all types, for the given actor.
     * 
     * @param actor A matrix persona actor.
     * @returns Any possible matrix traget visible to the actor.
     */
    getTargets(actor: SR5Actor) {
        if (!actor.hasPersona) {
            return { targets: [] } 
        }

        // Prepare all targets based on network connection.
        const network = actor.network;
        const targets = network?.isType('host') ?
            this.prepareHostTargets(actor) :
            this.prepareGridTargets(actor);

        return { targets };
    },

    /**
     * Prepare a list of possible matrix targets in a host network for the given persona matrix icon.
     * 
     * @param actor The actor to use as matrix icon.
     */
    prepareHostTargets(actor: SR5Actor) {
        const host = actor.network;
        if (!host?.isType('host')) {
            console.error('Shadowrun 5e | Actor is not connected to a host network');
            return [];
        }

        const targets: Shadowrun.MatrixTargetDocument[] = []

        for (const slave of host.slaves) {
            const type = MatrixNetworkFlow.getDocumentType(slave);
            // For persona slaves get their possible token.
            // taM check this
            const token = 'getToken' in slave ? slave.getToken() : null;

            // Remove the actor itself from the list of targets.
            if (slave.uuid === actor.uuid) continue;

            targets.push({
                name: slave.name,
                type,
                document: slave,
                token,
                runningSilent: slave.isRunningSilent(),
                network: host.name || '',
                icons: []
            });
        }

        return targets;
    },

    /**
     * Prepare a list of Matrix Targets that are all Owned Icons
     * This is unrelated to the PAN -- this is based on whether the actor "owns" the item in terms of Shadowrun ownership
     * @param actor
     */
    prepareOwnIcons(actor: SR5Actor): MatrixTargetDocument[] {
        const targets: MatrixTargetDocument[] = [];

        // gather all actors and find the actors that we have ownership of (shadowrun character ownership, not Foundry Player ownership)
        const actors = ActorOwnershipFlow.ownedActorIconsOf(actor);

        for (const slave of actors) {
            const type = MatrixNetworkFlow.getDocumentType(slave);
            const name = slave.getToken()?.name ?? slave.name;
            targets.push({
                name,
                document: slave,
                token: null,
                runningSilent: slave.isRunningSilent(),
                network: this._getNetworkName(slave.network),
                type,
                icons: []
            })
        }
        // add ourselves to the front so that our own Persona sits at the top
        const type = MatrixNetworkFlow.getDocumentType(actor);
        targets.unshift({
            name: actor.getToken()?.name ?? actor.name,
            document: actor,
            token: actor.getToken(),
            runningSilent: actor.isRunningSilent(),
            network: this._getNetworkName(actor.network),
            type,
            icons: []

        })

        return targets;
    },

    /**
     * Prepare a list of possible matrix targets in a grid network for the given persona matrix icon.
     * @param actor The actor to use as matrix icon.
     */
    prepareGridTargets(actor: SR5Actor) {
        const targets: Shadowrun.MatrixTargetDocument[] = [];

        // Collect all grid connected documents without scene tokens.
        // Scene Tokens will be collected separately.
        for (const grid of MatrixNetworkFlow.getGrids({ players: true })) {
            for (const slave of grid.slaves) {
                // Skip actor tokens as they're collected separately.
                if (slave instanceof SR5Actor && slave.getToken()) continue;

                const type = MatrixNetworkFlow.getDocumentType(slave);

                targets.push({
                    name: slave.name,
                    document: slave,
                    token: null,
                    runningSilent: slave.isRunningSilent(),
                    network: grid.name || '',
                    type,
                    icons: []
                });
            }
        }

        // Collect all scene tokens, which might also include personas outside any grid.
        if (canvas.scene?.tokens) {
            // Collect all scene tokens.
            for (const token of canvas.scene?.tokens) {
                // Throw away unneeded tokens.
                if (!token.actor) continue;
                const target = token.actor;
                /// Remove the actor itself from the list of targets.
                if (target.uuid === actor.uuid) continue;
                // Validate Foundry VTT visibility.
                if (!game.user?.isGM && token.hidden) continue;
                // Filter out IC as they can't be targeted outside their host.
                if (target.isType('ic')) continue;

                // Filter out persona based on matrix rules.
                if (!actor.matrixPersonaIsVisible(target)) continue;

                const type = MatrixNetworkFlow.getDocumentType(target);
                targets.push({
                    name: token.name,
                    document: token.actor,
                    token,
                    runningSilent: token.actor.isRunningSilent(),
                    network: token.actor.network?.name ?? '',
                    type,
                    icons: []
                })
            }
        }


        // Sort all targets by grid name first and target name second.
        targets.sort((a, b) => {
            const gridNameA = a.network.toLowerCase();
            const gridNameB = b.network.toLowerCase();
            const nameA = a.document.name.toLowerCase();
            const nameB = b.document.name.toLowerCase();

            if (gridNameA < gridNameB) return -1;
            if (gridNameA > gridNameB) return 1;
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

        return targets;
    },

    /**
     * Collect matrix icons connected to the document given by uuid.
     * 
     * TODO: Look into MarkPlacementFlow_prepareActorDevices and merge functionality.
     * @param document 
     * @returns List of matrix icons connected to the document.
     */
    getConnectedMatrixIconTargets(document: SR5Actor) {
        const connectedIcons: Shadowrun.MarkedDocument[] = [];

        // Only persona icons should show connected icons.
        if (!(document instanceof SR5Actor)) return connectedIcons;

        const personaDevice = document.getMatrixDevice();
        for (const device of ActorOwnershipFlow.ownedItemIconsOf(document)) {
            // Persona devices don't have their own device icon.
            if (personaDevice && device.uuid === personaDevice.uuid) continue;

            connectedIcons.push({
                name: Helpers.getChatSpeakerName(device),
                document: device,
                token: null,
                runningSilent: device.isRunningSilent(),
                network: this._getNetworkName(device.master),
                type: MatrixNetworkFlow.getDocumentType(device),
                icons: [],
                marks: 0,
                markId: null,
            });
        }

        return connectedIcons;
    },

    /**
     * Get the best name for a network for display purposes
     * - if the network is a host or grid, use its name
     * - if the network is a device, use the name of the actor it represents
     * @param master
     */
    _getNetworkName(master: SR5Item | null | undefined) {
        if (master) {
            if (master.isType('host', 'grid')) {
                return master.name;
            }

            if (master.isType('device') && master.persona) {
                const actor = master.persona;
                return actor.getToken()?.name ?? actor.name;
            }
        }
        return '';
    }
}
