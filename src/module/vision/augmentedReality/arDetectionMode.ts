
//todo: v10 foundry-vtt-types 

import AugmentedRealityVisionFilter from "./arFilter";

export default class AugmentedRealityVisionDetectionMode extends foundry.canvas.perception.DetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= AugmentedRealityVisionFilter.create();
    }
  
    override _canDetect(visionSource, target) {
        const tgt = target?.document;
        const targetHasIcon =
            tgt instanceof TokenDocument && tgt.actor !== null
            && tgt.actor.system.visibilityChecks.matrix.hasIcon;

        const targetIsNotRunningSilent = !tgt.actor?.system.visibilityChecks.matrix.runningSilent

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

        return targetHasIcon && targetIsNotRunningSilent && !isAstralPerceiving;
    }
}
  