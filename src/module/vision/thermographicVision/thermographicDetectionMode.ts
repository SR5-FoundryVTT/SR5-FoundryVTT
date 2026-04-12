import { resolveDetectionModeRange } from '../detectionRange';
import ThermographicVisionFilter from './thermographicFilter';

export default class ThermographicVisionDetectionMode extends foundry.canvas.perception.DetectionMode {
    static override getDetectionFilter() {
        return (this._detectionFilter ??= ThermographicVisionFilter.create());
    }
  
    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        if (!super._canDetect(visionSource, target)) return false;

        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        if (!tgt) return false;

        const targetHasHeat = !!tgt?.actor?.system.visibilityChecks.meat.hasHeat;

        const isAstralPerceiving = visionSource?.visionMode?.id === 'astralPerception';

        return targetHasHeat && !isAstralPerceiving;
    }

    override _testRange(
        ...[visionSource, mode, target, test]: Parameters<foundry.canvas.perception.DetectionMode['_testRange']>
    ) {
        const range = resolveDetectionModeRange(visionSource, mode);
        return super._testRange(visionSource, { ...mode, range }, target, test);
    }
}
  