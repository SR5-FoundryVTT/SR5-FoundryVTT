import { resolveDetectionModeRange } from '../detectionRange';
import { isBlockedBySR5Templates, isBlockedBySR5Walls, resolveVisionSourceOrigin } from '../losHelpers';
import { hasTargetPresenceOnPlane, resolveVisionSourcePlane } from '../visionModeState';
import ThermographicVisionFilter from './thermographicFilter';

export default class ThermographicVisionDetectionMode extends foundry.canvas.perception.DetectionMode {
    static override getDetectionFilter() {
        return (this._detectionFilter ??= ThermographicVisionFilter.create());
    }
  
    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        if (!super._canDetect(visionSource, target)) return false;

        const activePlane = resolveVisionSourcePlane(visionSource);
        if (activePlane !== 'physical' || !hasTargetPresenceOnPlane(target, activePlane)) {
            return false;
        }

        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        if (!tgt) return false;

        const targetHasHeat = !!tgt?.actor?.system.visibilityChecks.meat.hasHeat;

        return targetHasHeat;
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

        return !isBlockedBySR5Templates(origin, test.point, 'thermographic');
    }
}
  