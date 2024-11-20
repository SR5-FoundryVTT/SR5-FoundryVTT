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
    */
    async setOverwatchScore(actor: SR5Actor, score: number) {
        if (!isNaN(score)) return;
        const uuid = Helpers.uuidForStorage(actor.uuid);
        const ow = OverwatchStorage.getStorage();
        ow[uuid] = { score };
        await DataStorage.set(OverwatchStorage.key, ow);
    },

    /**
     * Retrieve the overwatch score for a given actor.
     */
    getOverwatchScore(actor: SR5Actor): number {
        const uuid = Helpers.uuidFromStorage(actor.uuid);
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
        return await DataStorage.set(OverwatchStorage.key, ow);
    },

    /**
     * Untrack an actor for overwatch score.
     */
    async untrackActor(actor: SR5Actor) {
        const uuid = Helpers.uuidForStorage(actor.uuid);
        const ow = OverwatchStorage.getStorage();
        delete ow[uuid];
        return await DataStorage.set(OverwatchStorage.key, ow);
    },

    /**
     * Retrieve all actors that are currently tracked.
     */
    trackedActors() {
        const ow = OverwatchStorage.getStorage();
        const uuids = Object.keys(ow).map(uuid => Helpers.uuidFromStorage(uuid));
        return uuids.map(uuid => fromUuidSync(uuid)).filter(document => document !== null) as SR5Actor[];
    },

    /**
     * Helper to retrieve valid storage.
     */
    getStorage(): Shadowrun.Storage['matrix']['ow'] {
        return DataStorage.get(OverwatchStorage.key) ?? {};
    }
}
