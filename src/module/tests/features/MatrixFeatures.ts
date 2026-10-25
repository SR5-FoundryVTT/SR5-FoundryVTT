import { MarkPlacementFlow, MatrixPlacementData } from "../flows/MarkPlacementFlow";
import type { BruteForceTest } from "../BruteForceTest";
import { TestFeatures } from "./TestFeature";

/**
 * Features of matrix tests, shared by several test kinds.
 */
export const registerMatrixFeatures = () => {
    /**
     * Placing marks on an icon, as Brute Force and Hack on the Fly do. SR5#238, SR5#240.
     *
     * The user picks how many marks to place, each extra mark costs dice. See MarkPlacementFlow.
     */
    TestFeatures.markPlacement = {
        id: 'markPlacement',
        prepareData(test) {
            MarkPlacementFlow._prepareData(test.data as MatrixPlacementData);
        },
        prepareTestModifiers(test) {
            MarkPlacementFlow.prepareTestModifiers(test as BruteForceTest);
        },
        validate(test) {
            MarkPlacementFlow.validateBaseValues(test as BruteForceTest);
        },
    };
};
