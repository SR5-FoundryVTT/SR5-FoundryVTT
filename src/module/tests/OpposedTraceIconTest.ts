import { OpposedMatrixTest } from '@/module/tests/OpposedMatrixTest';
import { MatrixTraceFlow } from '@/module/vision/augmentedReality/MatrixTraceFlow';

/**
 * Implement the opposing test for the Trace Icon action. See SR5#243 'Trace Icon'
 */
export class OpposedTraceIconTest extends OpposedMatrixTest {
    /**
     * When failing against a trace, the tracer learns where the icon is while they keep a mark on it.
     */
    override async processFailure() {
        if (!this.icon || !this.against.actor) {
            console.error('Shadowrun 5e | Expected an active decker or icon', this.against.actor, this.icon);
            return;
        }

        await MatrixTraceFlow.trace(this.against.actor, this.icon);
    }
}
