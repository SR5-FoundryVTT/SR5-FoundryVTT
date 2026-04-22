import { resolveDetectionModeRange } from '../detectionRange';
import { isBlockedBySR5Templates, resolveVisionSourceOrigin } from '../losHelpers';
import { isVisionSourceMode } from '../visionModeState';
import LowLightVisionFilter from './lowlightFilter';

export default class LowlightVisionDetectionMode extends foundry.canvas.perception.DetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= LowLightVisionFilter.create();
    }

    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        if (!super._canDetect(visionSource, target)) return false;

        const isAstralPerceiving = isVisionSourceMode(visionSource, 'astralPerception');

        return !isAstralPerceiving;
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
        if (!super._testLOS(visionSource, mode, target, test)) {
            return false;
        }

        const origin = resolveVisionSourceOrigin(visionSource);

        return !isBlockedBySR5Templates(origin, test.point, 'lowlight');
    }
}
  