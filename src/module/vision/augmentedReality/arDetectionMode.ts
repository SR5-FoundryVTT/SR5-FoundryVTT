
//todo: v10 foundry-vtt-types 

import AugmentedRealityVisionFilter from "./arFilter";

export default class AugmentedRealityVisionDetectionMode extends foundry.canvas.perception.DetectionMode {

    static override getDetectionFilter() {
        this._detectionFilter ??= AugmentedRealityVisionFilter.create();
        return this._detectionFilter;
    }
  
    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        const targetHasIcon = !!tgt?.actor?.system.visibilityChecks.matrix.hasIcon;

        const targetIsNotRunningSilent = !tgt?.actor?.system.visibilityChecks.matrix.runningSilent

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

        return targetHasIcon && targetIsNotRunningSilent && !isAstralPerceiving;
    }
}
  