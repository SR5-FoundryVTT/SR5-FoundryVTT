/**
 * Options given to determine roll data of a source document during test creation.
 */
export interface RollDataOptions {
    // If roll is part of an opposed test, this will contain the data of the original success test.
    againstData?: any
}