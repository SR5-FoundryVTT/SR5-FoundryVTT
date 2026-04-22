import { resolveDetectionModeRange } from '../detectionRange';
import { isBlockedBySR5Walls, resolveVisionSourceOrigin } from '../losHelpers';
import { hasTargetPresenceOnPlane, resolveVisionSourcePlane } from '../visionModeState';
import MatrixVisionFilter from './matrixFilter';

export default class MatrixVisionDetectionMode extends foundry.canvas.perception.DetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= MatrixVisionFilter.create();
    }
  
    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        if (!super._canDetect(visionSource, target)) return false;

        const activePlane = resolveVisionSourcePlane(visionSource);
        if (activePlane !== 'matrix' || !hasTargetPresenceOnPlane(target, activePlane)) {
            return false;
        }

        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        if (!tgt) return false;

        const targetIsNotRunningSilent = !tgt?.actor?.system.visibilityChecks.matrix.runningSilent;

        return targetIsNotRunningSilent;
    }

    override _testRange(
        ...[visionSource, mode, target, test]: Parameters<foundry.canvas.perception.DetectionMode['_testRange']>
    ) {
        const range = resolveDetectionModeRange(visionSource, mode);
        return super._testRange(visionSource, { ...mode, range }, target, test);
    }

    override _testLOS(
        ...[visionSource, mode, target, test]: Parameters<foundry.canvas.perception.DetectionMode['_testLOS']>
    ) {
        const origin = resolveVisionSourceOrigin(visionSource);

        if (isBlockedBySR5Walls(origin, test.point, 'matrix', 'matrix')) {
            return false;
        }

        return this._testAngle(visionSource, mode, target, test);
    }
}
