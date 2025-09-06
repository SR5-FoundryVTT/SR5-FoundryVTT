import { MatrixTest } from './MatrixTest';

/**
 * Check Overwatch Score is a Matrix Test that is opposed by the GM
 * - for Game simplicity, we use the actor's Host or Grid
 */
export class CheckOverwatchScoreTest extends MatrixTest {

    /**
     * We only want to populate with the GRID or Host that the actor is connected to
     */
    override async populateDocuments() {
        await super.populateDocuments();
        const network = this.actor?.network;
        if (network) {
            if (network.isType('grid')) {
                this.grid = network;
            }
            if (network.isType('host')) {
                this.host = network;
            }
        }
    }
}
