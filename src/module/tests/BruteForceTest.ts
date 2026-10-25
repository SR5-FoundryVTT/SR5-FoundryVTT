import { MatrixPlacementData } from './flows/MarkPlacementFlow';
import { MatrixTest } from './MatrixTest';

/**
 * Brute force tests implement the Brute Force action on SR5#238
 * 
 * See MarkPlacementFlow for more details on the test flow.
 */
export class BruteForceTest extends MatrixTest<MatrixPlacementData> {
    // Mark placement prepares the data, adds the dice cost of extra marks and validates them.
    static override features = ['markPlacement'];

    /**
     * Brute Force is a matrix action.
     */
    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['matrix', 'brute_force'];
    }
}
