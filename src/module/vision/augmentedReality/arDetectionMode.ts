
//todo: v10 foundry-vtt-types 

import AugmentedRealityVisionFilter from "./arFilter";

//@ts-expect-error
export default class AugmentedRealityVisionDetectionMode extends DetectionMode {

  //@ts-expect-error
  static override getDetectionFilter() {
    //@ts-expect-error
    return this._detectionFilter ??= AugmentedRealityVisionFilter.create();

    // return this._detectionFilter ??= GlowOverlayFilter.create({
    //   glowColor: [0, 0.25, 0.75, 1]
    // });
  }
  
    //@ts-expect-error
    override _canDetect(visionSource, target) {
      const tgt = target?.document;
      const targetHasIcon =
        tgt instanceof TokenDocument
        && tgt.actor?.system.visibilityChecks.matrix.hasIcon;

      const targetIsNotRunningSilent = !tgt.actor?.system.visibilityChecks.matrix.runningSilent

      const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

      return targetHasIcon && targetIsNotRunningSilent && !isAstralPerceiving
    }
  }
  