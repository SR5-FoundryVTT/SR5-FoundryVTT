
//todo: v10 foundry-vtt-types 

import AugmentedRealityVisionFilter from "./arFilter";

//@ts-expect-error // TODO: foundry-vtt-types v10
export default class AugmentedRealityVisionDetectionMode extends DetectionMode {

  //@ts-expect-error // TODO: foundry-vtt-types v10
  static override getDetectionFilter() {
    //@ts-expect-error // TODO: foundry-vtt-types v10
    this._detectionFilter ??= AugmentedRealityVisionFilter.create();
    //@ts-expect-error // TODO: foundry-vtt-types v10
    return this._detectionFilter;

    // return this._detectionFilter ??= GlowOverlayFilter.create({
    //   glowColor: [0, 0.25, 0.75, 1]
    // });
  }
  
    //@ts-expect-error // TODO: foundry-vtt-types v10
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
  