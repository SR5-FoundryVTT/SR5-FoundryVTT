import { SR5Actor } from "../actor/SR5Actor";
import { MatrixTest } from "./MatrixTest";
import { MatrixPlacementData } from "./flows/MarkPlacementFlow";

/**
 * Hack on the Fly tests implement the Hack on the Fly action on SR5#240
 *
 * See MarkPlacementFlow for more details on the test flow.
 */
export class HackOnTheFlyTest extends MatrixTest<MatrixPlacementData> {
    declare actor: SR5Actor;

    // Mark placement prepares the data, adds the dice cost of extra marks and validates them.
    static override features = ['markPlacement'];

    /**
     * Brute Force is a matrix action.
     */
    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['matrix', 'hack_on_the_fly'];
    }

}
