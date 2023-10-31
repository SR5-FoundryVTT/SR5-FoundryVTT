
import ThermographicVisionFilter from './thermographicFilter';

//todo: v10 foundry-vtt-types 
//@ts-expect-error
export default class ThermographicVisionDetectionMode extends DetectionMode {

  //@ts-expect-error
  static override getDetectionFilter() {
    //@ts-expect-error
    return (this._detectionFilter ??= ThermographicVisionFilter.create());
  }

  
    //@ts-expect-error
    override _canDetect(visionSource, target) {
      const tgt = target?.document;
      const targetHasHeat =
        tgt instanceof TokenDocument
        && tgt.actor?.system.visibilityChecks.meat.hasHeat;

      const targetIsVisible =
        tgt instanceof TokenDocument
        && !tgt.actor?.system.visibilityChecks.meat.hidden;


      return targetHasHeat && targetIsVisible

    }
  }
  