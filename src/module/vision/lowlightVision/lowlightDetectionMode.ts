
//todo: v10 foundry-vtt-types 
//@ts-expect-error
export default class LowlightVisionDetectionMode extends DetectionMode {

  //@ts-expect-error
  static override getDetectionFilter() {
    //@ts-expect-error
    return this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [0, 1, 0, 1],
      knockout: true,
      wave: true
    })
  }

  
    //@ts-expect-error
    override _canDetect(visionSource, target) {
      const tgt = target?.document;
      const targetIsVisible =
        tgt instanceof TokenDocument
        && !tgt.actor?.system.visibilityChecks.meat.hidden;

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

      return targetIsVisible && !isAstralPerceiving

    }
  }
  