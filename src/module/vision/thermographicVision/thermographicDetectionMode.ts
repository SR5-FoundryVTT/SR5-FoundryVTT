
import ThermographicVisionFilter from './thermographicFilter';

//@ts-expect-error // TODO: foundry-vtt-types v10
export default class ThermographicVisionDetectionMode extends DetectionMode {

  static getDetectionFilter() {
    //@ts-expect-error // TODO: foundry-vtt-types v10
    return (this._detectionFilter ??= ThermographicVisionFilter.create());
  }


  _canDetect(visionSource, target) {
    const tgt = target?.document;
    const targetHasHeat =
      tgt instanceof TokenDocument
      && tgt.actor?.system.visibilityChecks.meat.hasHeat;

    const targetIsVisible =
      tgt instanceof TokenDocument
      //@ts-expect-error // TODO: foundry-vtt-types v10
      && !tgt.actor?.statuses.has(CONFIG.specialStatusEffects.INVISIBLE);

    const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

    return targetHasHeat && targetIsVisible && !isAstralPerceiving

  }
}
