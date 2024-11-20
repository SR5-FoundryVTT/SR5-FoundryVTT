import { MarksStorage } from "./MarksStorage";
import { OverwatchStorage } from "./OverwatchStorage";

/**
 * Manage all storage data within the global storage.
 */
export const Storage = {
    matrix: {
        marks: MarksStorage,
        ow: OverwatchStorage
    }
}
