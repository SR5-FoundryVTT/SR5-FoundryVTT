import { DataStorage } from "../data/DataStorage";
import { ExtendedTestRecord } from "../types/flows/ExtendedTest";

/**
 * General functionality around storing extended test records in global storage.
 *
 * Records are stored per id underneath one top level key. Writes use per record
 * keys so simultaneous updates on different records don't overwrite each other.
 */
export const ExtendedTestStorage = {
    // The global data storage key for extended tests.
    key: 'extendedTests',

    /**
     * Retrieve all extended test records.
     */
    getAll(): Record<string, ExtendedTestRecord> {
        return DataStorage.get<Record<string, ExtendedTestRecord>>(ExtendedTestStorage.key) ?? {};
    },

    /**
     * Retrieve a single extended test record.
     */
    get(id: string): ExtendedTestRecord | undefined {
        return DataStorage.get<ExtendedTestRecord>(`${ExtendedTestStorage.key}.${id}`);
    },

    /**
     * Store a single extended test record.
     *
     * Uses a per record key to limit last-write-wins collisions to that record.
     */
    async setRecord(record: ExtendedTestRecord) {
        if (!record.id) return;
        await DataStorage.set(`${ExtendedTestStorage.key}.${record.id}`, record);
    },

    /**
     * Delete a single extended test record.
     *
     * Uses a per record key, so deleting one record can't revert concurrent writes to another.
     */
    async delete(id: string) {
        await DataStorage.unset(`${ExtendedTestStorage.key}.${id}`);
    },

    /**
     * Remove all extended test records.
     */
    async clear() {
        await DataStorage.set(ExtendedTestStorage.key, {});
    },
}
