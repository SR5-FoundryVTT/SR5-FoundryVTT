import LowLightVisionFilter from "./lowlightFilter";

//@ts-expect-error // TODO: foundry-vtt-types v10
export default class LowlightVisionDetectionMode extends DetectionMode {

  static getDetectionFilter() {
    //@ts-expect-error // TODO: foundry-vtt-types v10
    this._detectionFilter ??= LowLightVisionFilter.create();
    //@ts-expect-error // TODO: foundry-vtt-types v10
    return this._detectionFilter;
  }

  _canDetect(visionSource, target) {
    const tgt = target?.document;
    const targetIsVisible =
      tgt instanceof TokenDocument
      //@ts-expect-error // TODO: foundry-vtt-types v10
      && !tgt.actor?.statuses.has(CONFIG.specialStatusEffects.INVISIBLE);

    const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

    return targetIsVisible && !isAstralPerceiving

  }
}
