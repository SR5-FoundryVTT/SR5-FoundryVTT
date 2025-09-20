import { ActionRollType } from "../types/item/Action"

/**
 * Options given to determine roll data of a source document during test creation.
 */
export interface RollDataOptions {
    // The action that caused this role.
    action?: ActionRollType
    // The active test for this roll. This can be a SuccessTest or a OpposedTest.
    // OpposedTest will also provide againstData.
    testData?: any
    // If roll is part of an opposed test, this will contain the data of the original success test.
    againstData?: any
}