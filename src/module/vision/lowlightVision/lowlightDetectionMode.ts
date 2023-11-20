
//todo: v10 foundry-vtt-types 

import LowLightVisionFilter from "./lowlightFilter";

//@ts-expect-error
export default class LowlightVisionDetectionMode extends DetectionMode {

  //@ts-expect-error
  static override getDetectionFilter() {
    //@ts-expect-error
    return this._detectionFilter ??= LowLightVisionFilter.create();
  }

  
    //@ts-expect-error
    override _canDetect(visionSource, target) {
      const tgt = target?.document;
      const targetIsVisible =
        tgt instanceof TokenDocument
        //@ts-expect-error
        && !tgt.actor?.statuses.has(CONFIG.specialStatusEffects.INVISIBLE);

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

      return targetIsVisible && !isAstralPerceiving

    }
  }
  