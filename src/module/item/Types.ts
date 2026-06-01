import { ActionRollType } from "../types/item/Action"

/**
 * Structural duck-type for test data passed into getRollData.
 * Captures exactly what roll data flows read from testData/againstData.
 */
export interface RollDataTestAccessor {
    // The action driving this test, used to determine categories and test type.
    action?: ActionRollType;
    // Matrix-specific: whether this test has a direct connection to the target.
    directConnection?: boolean;
}

/**
 * Options given to determine roll data of a source document during test creation.
 */
export interface RollDataOptions {
    // The action that caused this roll.
    action?: ActionRollType
    // The active test for this roll. This can be a SuccessTest or an OpposedTest.
    // OpposedTest will also provide againstData.
    testData?: RollDataOptions
    // If roll is part of an opposed test, this will contain the data of the original success test.
    againstData?: RollDataOptions
    // If true, the system data will be copied instead of just taken as is.
    // NOTE: by default FoundryVTT returns system data as the original instance.
    copySystem?: boolean
}
