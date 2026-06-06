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

        if (!actor.uuid) return [];

        // gather all actors and find the actors that we have ownership of (shadowrun character ownership, not Foundry Player ownership)
        const actors = game.actors.filter((a) => {
            // we don't want to include our own persona in this list
            if (a === actor) return false;
            return a instanceof SR5Actor && ActorOwnershipFlow._isOwnerOfActor(actor, a) && !a.getToken();
        });

        for (const slave of actors) {
            // Filter out the actor itself.
            if (slave.uuid === actor.uuid) continue;

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
        if (canvas.scene?.tokens) {
            // go through the canvas tokens and see if we own any of them
            for (const token of canvas.scene.tokens) {
                if (!token.actor?.uuid) continue;
                // again don't add ourselves, we do that later
                if (token.actor.uuid === actor.uuid) continue;
                if (token.actor instanceof SR5Actor && ActorOwnershipFlow._isOwnerOfActor(actor, token.actor)) {
                    const type = MatrixNetworkFlow.getDocumentType(token.actor);
                    targets.push({
                        name: token.name,
                        document: token.actor as Actor.Stored,
                        token,
                        runningSilent: token.actor.isRunningSilent(),
                        network: this._getNetworkName(token.actor.network),
                        type,
                        icons: []
                    })
                }
            }
        }
        // add ourselves to the front so that our own Persona sits at the top
        const type = MatrixNetworkFlow.getDocumentType(actor);
        targets.unshift({
            name: actor.getToken()?.name ?? actor.name,
            document: actor as Actor.Stored,
            token: actor.getToken(),
            runningSilent: actor.isRunningSilent(),
            network: this._getNetworkName(actor.network),
            type,
            icons: []
        });

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
                // Filter out the actor itself.
                if (slave.uuid === actor.uuid) continue;

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
            for (const token of canvas.scene.tokens) {
                // Throw away unneeded tokens.
                if (!token.actor?.uuid) continue;
                const target = token.actor;
                /// Remove the actor itself from the list of targets.
                if (target.uuid === actor.uuid) continue;
                // Validate Foundry VTT visibility.
                if (!game.user?.isGM && token.hidden) continue;
                // Filter out IC as they can't be targeted outside their host.
                if (target.isType('ic')) continue;

                // Filter out persona based on matrix rules.
                if (!actor.matrixPersonaIsVisible(target)) continue;

                // filter out targets that don't have a persona or any wireless devices
                if (!target.hasPersona && !target.hasWirelessDevices()) continue;

                const type = MatrixNetworkFlow.getDocumentType(target);
                targets.push({
                    name: token.name,
                    document: token.actor as Actor.Stored,
                    token,
                    runningSilent: token.actor.isRunningSilent(),
                    network: token.actor.network?.name ?? '',
                    type,
                    icons: []
                })
            }
        }

        this._dedupeTargetsByDocumentUuid(targets);
        this._removeInvisibleIcons(targets);

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
     * Currently we show silent icons, whenever a persona has other online devices visible.
     * @param targets List of any kind of icon targets.
     */
    _removeInvisibleIcons(targets: MatrixTargetDocument[]) {
        for (let index = targets.length - 1; index >= 0; index -= 1) {
            const target = targets[index].document;
            if (!MatrixTargetingFlow.isIconVisible(target)) targets.splice(index, 1);
        }
    },

    /**
     * Given any icon, check if this icon is generally visible.
     * @param icon The icon to check the visibility for.
     */
    isIconVisible(icon: SR5Actor|SR5Item) {
        if (icon.isOfflineIcon()) return false;
        if (icon instanceof SR5Actor && icon.isRunningSilent() && !icon.hasNonPersonaWirelessDevices()) return false;
        if (icon instanceof SR5Item && icon.isRunningSilent()) return false;
        return true;
    },

    /**
     * Collect matrix icons connected to the document given by uuid.
     * 
     * @param document Retrieve icons connected to this document.
     * @returns List of matrix icons that can be targeted wirelessly.
     */
    getWirelessMatrixIconTargets(document: SR5Actor) {
        const connectedIcons: Shadowrun.MarkedDocument[] = [];

        // Only persona icons should show connected icons.
        if (!(document instanceof SR5Actor)) return connectedIcons;

        const personaDevice = document.getMatrixDevice();
        for (const device of document.wirelessDevices()) {
            // Persona devices don't have their own device icon.
            if (device.uuid === personaDevice?.uuid) continue;
            if (device.isRunningSilent()) continue;

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
     * Dedpulicate targets entry as the same document can be added mulitple times by different means.
     * 
     * One case would be a linked actor having three tokens on scene.
     * 
     * @param targets A list of matrix targets to deduplicate. The list is modified in place.
     */
    _dedupeTargetsByDocumentUuid(targets: MatrixTargetDocument[]) {
        const seenDocumentUuids = new Set<string>();

        // Iterate classicly for index.
        for (let index = targets.length - 1; index >= 0; index -= 1) {
            const documentUuid = targets[index].document.uuid;

            if (seenDocumentUuids.has(documentUuid)) {
                targets.splice(index, 1);
                continue;
            }

            seenDocumentUuids.add(documentUuid);
        }
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
