import { DataStorage } from '../data/DataStorage';
import { MatrixRules } from '../rules/MatrixRules';

/**
 * Options for the setMarks method.
 */
export interface SetMarksOptions {
    // Instead of adding marks, set the given amount.
    overwrite?: boolean
    // If not target is given, use this name to indicate mark placement without document present.
    name?: string
}

/**
 * General functionality around marks without shadowrun rules.
 * 
 * Mark placement is a bit complicated, as it's split into
 * - actor mark placement => ActorMarksFlow
 * - item mark placement => ItemMarksFlow
 * - test mark placement => MarkPlacementFlow
 *   
 * TODO: Deleting an document (actor), must delete the storage marks as well
 * TODO: Deleting a scene token must delete the storage marks as well
 *  
 * Everything abstracted across those is placed here to avoid duplication.
 * Use the global storage to store and retrieve marks data for all documents.
 */
export const MarksStorageFlow = {
    /**
     * Set a specific mark while overwriting a documents place marks fully. 
     * 
     * @param marksData The current marks data to be altered.
     * @param target The document that is marked.
     * @param currentMarks The current amount of marks on the document.
     * @param marks The amount of marks to be added or set.
     * 
     * @returns marksData, altered in place.
     */
    setMarks(marksData: Shadowrun.MatrixMarks, target: Shadowrun.NetworkDevice | undefined, currentMarks: number, marks: number, options: SetMarksOptions = {}) {
        // TODO: Allow for no target
        if (!target) return [];

        // Reset marks instead of added additional.
        currentMarks = options.overwrite ? 0 : currentMarks;

        let mark = marksData.find(mark => mark.uuid === target?.uuid);

        // Either alter the existing mark or create a new one.
        if (mark) {
            mark.marks = MatrixRules.getValidMarksCount(currentMarks + marks);
        } else {
            mark = {
                uuid: target.uuid,
                name: target.name ?? '',
                marks: MatrixRules.getValidMarksCount(currentMarks + marks)
            }
            marksData.push(mark);
        }

        return marksData;
    },

    /**
     * Get marks data for one specific actor.
     * @param document 
     * @returns 
     */
    getMarksData(document: Shadowrun.NetworkDevice): Shadowrun.MatrixMarks {
        const uuid = MarksStorageFlow._uuidForStorage(document.uuid);
        return DataStorage.get(`matrix.marks.${uuid}`) ?? [];
    },

    /**
     * Retrieve a mark placement for a possibly marked document.
     * 
     * @param marksData The marks data to be searched.
     * @param uuid The icons uuid
     */
    getMarksPlaced(marksData: Shadowrun.MatrixMarks, uuid: string) {
        return marksData.find(mark => mark.uuid === uuid)?.marks ?? 0;
    },

    /**
     * Store marks data in global storage for an active actor placing some marks on any kind of target.
     * 
     * @param document The actor placing any number of marks
     * @param marksData The raw marks data of the actor.
     */
    async storeMarks(document: Shadowrun.NetworkDevice, marksData: Shadowrun.MatrixMarks) {
        const uuid = MarksStorageFlow._uuidForStorage(document.uuid);
        const key = `matrix.marks.${uuid}`;
        await DataStorage.set(key, marksData);
    },

    /**
     * Retrieve all marks for a single actors from global storage.
     * @param document The actor to retrieve marks for
     * @returns The actors marks data
     */
    retrieveMarks(document: Shadowrun.NetworkDevice): Shadowrun.MatrixMarks {
        const allActorsMarksData = DataStorage.get('matrix.marks') ?? {};
        const uuid = MarksStorageFlow._uuidForStorage(document.uuid);
        return allActorsMarksData[uuid] ?? [];
    },

    /**
     * Retrieve a single mark for a single actor from global storage
     * 
     * @param document The actor retrieve the mark for
     * @param target The target matrix icon to have been marked by actor
     * @returns The amount of marks placed on the target.
     */
    retrieveMark(document: Shadowrun.NetworkDevice, target: Shadowrun.NetworkDevice): number {
        const marksData = MarksStorageFlow.retrieveMarks(document);
        return MarksStorageFlow.getMarksPlaced(marksData, target.uuid);
    },

    /**
     * Clear all marks from an actor from global storage.
     * 
     * @param document The actor to clear all marks for.
     */
    async clearMarks(document: Shadowrun.NetworkDevice) {
        await MarksStorageFlow.storeMarks(document, []);
    },

    /**
     * Remove any marks data from documents that can´t be found anymore.
     * 
     * Normally this should be handled during deletion triggers for documents and scenes, but the world is not perfect.
     */
    async cleanupOrphanedMarksData() {
        const allActorsMarksData = DataStorage.get('matrix.marks') ?? {};
        let changedData = false;
        for (const uuidFromStorage of Object.keys(allActorsMarksData)) {
            const uuid = MarksStorageFlow._uuidFromStorage(uuidFromStorage);

            const document = await fromUuid(uuid);
            if (document) continue;

            delete allActorsMarksData[uuidFromStorage];
            changedData = true;
        }

        if (!changedData) return;

        DataStorage.set('matrix.marks', allActorsMarksData);
    },

    _uuidForStorage(uuid) {
        return uuid.replace('.', '_');
    },

    _uuidFromStorage(uuid) {
        return uuid.replace('_', '.');
    }
}