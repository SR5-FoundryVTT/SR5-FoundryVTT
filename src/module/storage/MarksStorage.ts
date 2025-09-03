import { SR5Actor } from '../actor/SR5Actor';
import { DataStorage } from '../data/DataStorage';
import { SR5Item } from '../item/SR5Item';
import { MatrixRules } from '../rules/MatrixRules';
import { MatrixMarksType } from '../types/template/Matrix';
import { Helpers } from '@/module/helpers';

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
 * General functionality around storing matrix mark relationships in global storage.
 *
 * Within global storage no marks data is found but only relationsships between documents
 * formed by placing a mark on each other. This is used to avoid having to search all documents
 * for marks during document deletion, reboots and similar operations having to remove ALL marks of
 * a document.
 *
 * These are called mark relations here.
 *
 * TODO: Unittesting for this.
 *
 * Usage:
 * - Make sure to use the MarkStorageFlow#getStorage method rertrieve storage
 */
export const MarksStorage = {
    // The global data storage key for mark relationships.
    key: 'matrix.marks',
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
    setMarks(marksData: MatrixMarksType, target: SR5Actor | SR5Item | undefined, currentMarks: number, marks: number, options: SetMarksOptions = {}) {
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
     * Count amount of marks for a given document
     * @param marksData Marks data to count marks with
     * @param uuid Document to search for
     */
    getMarksPlaced(marksData: MatrixMarksType, uuid: string): number {
        const marks = marksData.find(marks => marks.uuid === uuid);
        return marks ? marks.marks : 0;
    },

    /**
     * Helper to retrieve a valid marks data storage.
     */
    getStorage(): Shadowrun.Storage['matrix']['marks'] {
        return DataStorage.get(MarksStorage.key) ?? {};
    },

    /**
     * Helper to retrieve valid marks relations from marks data storage.

     * @param uuid Uuid for that document.
     */
    getMarksRelations(uuid: string): string[] {
        const uuidForStorage = Helpers.uuidForStorage(uuid);
        const marksStorage = MarksStorage.getStorage();
        return marksStorage[`${MarksStorage.key}.${uuidForStorage}`] ?? [];
    },

    /**
     * Store marks data in global storage for an active actor placing some marks on any kind of target.
     *
     * @param uuid The document placing marks
     * @param marksData The raw marks data of the actor.
     */
    async storeRelations(uuid: string, marksData: MatrixMarksType) {
        const uuidForStorage = Helpers.uuidForStorage(uuid);
        const key = `${MarksStorage.key}.${uuidForStorage}`;
        const marks = marksData.map(({uuid}) => uuid);
        await DataStorage.set(key, marks);
        await MarksStorage.cleanupOrphanedRelations();
    },

    /**
     * Retrieve all marks for a single actors from global storage.
     * @param document The actor to retrieve marks for
     * @returns The actors marks data
     */
    retrieveMarks(document: SR5Actor | SR5Item): string[] {
        const storage = MarksStorage.getStorage();
        const uuid = Helpers.uuidForStorage(document.uuid);
        return storage[uuid] ?? [];
    },

    /**
     * Clear all marks relating to this document from storage.
     *
     * This includes both marks placed by and marks placed on this document.
     *
     * @param uuid The document to clear all marks for.
     */
    async clearRelations(uuid: string) {
        const storage = MarksStorage.getStorage();

        let changed = false;
        // Remove marks placed by.
        const uuidForStorage = Helpers.uuidForStorage(uuid);
        if (storage[uuidForStorage]) {
            changed = true;
            delete storage[uuidForStorage];
        }

        // Remove marks placed on.
        for (const [uuidForStorage, markRelations] of Object.entries(storage)) {
            // if we don't include the id, skip this object
            if (!markRelations.includes(uuid)) continue;
            changed = true;
            storage[uuidForStorage] = markRelations.filter(markedUuid => markedUuid !== uuid);

            // Update lokal marks placed on the main uuid.
            const document = fromUuidSync(Helpers.uuidFromStorage(uuidForStorage)) as SR5Actor | SR5Item;
            if (!document) continue;

            await document.clearMark(uuid);
        }

        if (changed) {
            await DataStorage.set(MarksStorage.key, storage);
        }
    },

    /**
     * Remove any marks data from documents that can´t be found anymore.
     *
     * Normally this should be handled during deletion triggers for documents and scenes, but the world is not perfect.
     */
    async cleanupOrphanedRelations() {
        const storage = MarksStorage.getStorage();
        for (const uuidFromStorage of Object.keys(storage)) {
            const uuid = Helpers.uuidFromStorage(uuidFromStorage);

            const document = fromUuidSync(uuid);
            if (document) continue;

            await MarksStorage.clearRelations(uuid);
        }
    },
}
