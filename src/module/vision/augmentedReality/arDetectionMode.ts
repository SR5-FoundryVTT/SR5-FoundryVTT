import { resolveDetectionModeRange } from '../detectionRange';
import AugmentedRealityVisionFilter from './arFilter';

export default class AugmentedRealityVisionDetectionMode extends foundry.canvas.perception.DetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= AugmentedRealityVisionFilter.create();
    }
  
    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        if (!super._canDetect(visionSource, target)) return false;

        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        if (!tgt) return false;

        const targetHasIcon = !!tgt?.actor?.system.visibilityChecks.matrix.hasIcon;

        const targetIsNotRunningSilent = !tgt?.actor?.system.visibilityChecks.matrix.runningSilent;

        const isAstralPerceiving = visionSource?.visionMode?.id === 'astralPerception';

        return targetHasIcon && targetIsNotRunningSilent && !isAstralPerceiving;
    }

    override _testRange(
        ...[visionSource, mode, target, test]: Parameters<foundry.canvas.perception.DetectionMode['_testRange']>
    ) {
        const range = resolveDetectionModeRange(visionSource, mode);
        return super._testRange(visionSource, { ...mode, range }, target, test);
    }
}
  