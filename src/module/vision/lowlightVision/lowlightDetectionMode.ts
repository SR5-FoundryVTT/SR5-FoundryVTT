import { resolveDetectionModeRange } from '../detectionRange';
import { isBlockedBySR5Templates, isBlockedBySR5Walls, resolveVisionSourceOrigin } from '../losHelpers';
import { hasTargetPresenceOnPlane, resolveVisionSourcePlane } from '../visionModeState';
import LowLightVisionFilter from './lowlightFilter';

export default class LowlightVisionDetectionMode extends foundry.canvas.perception.DetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= LowLightVisionFilter.create();
    }

    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        if (!super._canDetect(visionSource, target)) return false;

        const activePlane = resolveVisionSourcePlane(visionSource);
        if (activePlane !== 'physical') {
            return false;
        }

        return hasTargetPresenceOnPlane(target, activePlane);
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
        if (!this._testAngle(visionSource, mode, target, test)) {
            return false;
        }

        const origin = resolveVisionSourceOrigin(visionSource);
        if (isBlockedBySR5Walls(origin, test.point, 'physical', 'physical')) {
            return false;
        }

        return !isBlockedBySR5Templates(origin, test.point, 'lowlight');
    }
}
  