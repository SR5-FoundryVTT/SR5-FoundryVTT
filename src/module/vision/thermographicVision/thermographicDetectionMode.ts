
import ThermographicVisionFilter from './thermographicFilter';

//todo: v10 foundry-vtt-types 
//@ts-ignore
export default class ThermographicVisionDetectionMode extends DetectionMode {

  //@ts-ignore
  static override getDetectionFilter() {
    //@ts-ignore
    return (this._detectionFilter ??= ThermographicVisionFilter.create());
  }

  
    //@ts-ignore
    override _canDetect(visionSource, target) {
      const tgt = target?.document;
      const targetHasHeat =
        tgt instanceof TokenDocument
        && !tgt.actor?.system.visibilityChecks.meat.hasHeat;

      const targetIsVisible =
        tgt instanceof TokenDocument
        && !tgt.actor?.system.visibilityChecks.meat.hidden;


      return targetHasHeat && targetIsVisible

    }
  }
  