import { ActiveSensorLockFlow } from '@/module/flows/ActiveSensorLockFlow';
import { OpposedMatrixTest } from '@/module/tests/OpposedMatrixTest';
import { Translation } from '../utils/strings';

/**
 * Implement the opposing test for Active Sensor Targeting action.
 * SR5 p. 270 / Rigger 5.0 p. 182
 */
export class OpposedActiveSensorLockTest extends OpposedMatrixTest {
    override get successLabel(): Translation {
        return "SR5.TestResults.ActiveSensorLockFailure";
    }

    override get failureLabel(): Translation {
        return "SR5.TestResults.ActiveSensorLockSuccess";
    }

    /**
     * When defender fails the opposed test against active sensor targeting, the target lock is established
     * and the 'sr5sensorLock' status effect is toggled on the defender.
     */
    override async processFailure() {
        await super.processFailure();

        const attacker = this.against?.actor;
        const defender = this.actor;
        const netHits = this.againstNetHits?.value ?? Math.max(1, (this.against?.hits?.value ?? 0) - this.hits.value);

        if (attacker && defender && netHits > 0) {
            await ActiveSensorLockFlow.applySensorLock(attacker, defender, netHits);
        }
    }
}
