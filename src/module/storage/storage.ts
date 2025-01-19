import { DataStorage } from "../data/DataStorage";
import { MarksStorage } from "./MarksStorage";
import { OverwatchStorage } from "./OverwatchStorage";

/**
 * Manage all storage data within the global storage.
 * 
 * Avoid duplicating Storage in global namespace.
 */
export const SRStorage = {
    // Allow indirect access to specific storage data, matching the storage key they're connected to.
    matrix: {
        marks: MarksStorage,
        ow: OverwatchStorage
    },
    // Allow direct access to global data storage.
    _storage: DataStorage
}
