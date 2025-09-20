import { SR5Actor } from "../actor/SR5Actor";
import { DataStorage } from "../data/DataStorage";
import { Helpers } from "../helpers";

/**
 * General functionality around storing overwatch score values in global storage.
 */
export const OverwatchStorage = {
    // The global data storage key for overwatch scores.
    key: 'matrix.ow',

    /**
     * Set a specific overwatch score for a given actor
     */
    async setOverwatchScore(actor: SR5Actor, score: number) {
        if (isNaN(score)) return;
        const uuid = Helpers.uuidForStorage(actor.uuid);
        const ow = OverwatchStorage.getStorage();
        ow[uuid] = { score };
        await DataStorage.set(OverwatchStorage.key, ow);
    },

    /**
     * Retrieve the overwatch score for a given actor.
     */
    getOverwatchScore(actor: SR5Actor): number {
        const uuid = Helpers.uuidForStorage(actor.uuid);
        const ow = OverwatchStorage.getStorage();
        return ow[uuid]?.score ?? 0;
    },

    /**
     * Track an actor for overwatch score.
     */
    async trackActor(actor: SR5Actor) {
        const uuid = Helpers.uuidForStorage(actor.uuid);
        const ow = OverwatchStorage.getStorage();
        ow[uuid] = { score: 0 };
        return DataStorage.set(OverwatchStorage.key, ow);
    },

    /**
     * Untrack an actor for overwatch score.
     */
    async untrackActor(actor: SR5Actor) {
        const uuid = Helpers.uuidForStorage(actor.uuid);
        const ow = OverwatchStorage.getStorage();
        delete ow[uuid];
        return DataStorage.set(OverwatchStorage.key, ow);
    },

    /**
     * Retrieve all actors that are currently tracked.
     */
    trackedActors() {
        const ow = OverwatchStorage.getStorage();
        const uuids = Object.keys(ow).map(uuid => Helpers.uuidFromStorage(uuid));
        const documents = uuids.map(uuid => ({uuid, document: fromUuidSync(uuid)}));
        
        // Remove any deleted actors.
        const deletedActors = documents.filter(({uuid, document}) => document === null);
        if (deletedActors.length > 0) {
            deletedActors.forEach(({uuid}) => {
                const uuidStorage = Helpers.uuidForStorage(uuid);
                delete ow[uuidStorage];
            });
            // Ignore promise, as this can be handled in background.
            DataStorage.set(OverwatchStorage.key, ow);
        }

        return documents.filter(document => document !== null).map(({document}) => document) as SR5Actor[];
    },

    /**
     * Determine if the given actor is tracked for overwatch score.
     */
    isTrackedActor(actor: SR5Actor) {
        const uuid = Helpers.uuidForStorage(actor.uuid);
        const ow = OverwatchStorage.getStorage();
        return ow[uuid] !== undefined;
    },

    /**
     * Helper to retrieve valid storage.
     */
    getStorage(): Shadowrun.Storage['matrix']['ow'] {
        return DataStorage.get(OverwatchStorage.key) ?? {};
    },

    /**
     * Helper to clear all overwatch scores.
     */
    async clear() {
        await DataStorage.set(OverwatchStorage.key, {});
    },
}
