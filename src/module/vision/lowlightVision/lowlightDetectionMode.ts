import { resolveDetectionModeRange } from '../detectionRange';
import LowLightVisionFilter from './lowlightFilter';

export default class LowlightVisionDetectionMode extends foundry.canvas.perception.DetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= LowLightVisionFilter.create();
    }

    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        if (!super._canDetect(visionSource, target)) return false;

        const isAstralPerceiving = visionSource?.visionMode?.id === 'astralPerception';

        return !isAstralPerceiving;
    }

    override _testRange(
        ...[visionSource, mode, target, test]: Parameters<foundry.canvas.perception.DetectionMode['_testRange']>
    ) {
        const range = resolveDetectionModeRange(visionSource, mode);
        return super._testRange(visionSource, { ...mode, range }, target, test);
    }
}
  