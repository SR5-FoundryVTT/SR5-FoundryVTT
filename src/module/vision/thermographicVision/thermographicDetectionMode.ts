
import ThermographicVisionFilter from './thermographicFilter';

//todo: v10 foundry-vtt-types 
export default class ThermographicVisionDetectionMode extends DetectionMode {

  static override getDetectionFilter() {
    return (this._detectionFilter ??= ThermographicVisionFilter.create());
  }
  
    override _canDetect(visionSource, target) {
      const tgt = target?.document;
      const targetHasHeat =
        tgt instanceof TokenDocument
        && tgt.actor?.system.visibilityChecks.meat.hasHeat;

      const targetIsVisible =
        tgt instanceof TokenDocument
        && !tgt.actor?.statuses.has(CONFIG.specialStatusEffects.INVISIBLE);

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

      return targetHasHeat && targetIsVisible && !isAstralPerceiving

    }
  }
  