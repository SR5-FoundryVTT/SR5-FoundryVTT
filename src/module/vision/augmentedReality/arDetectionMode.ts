
import AugmentedRealityVisionFilter from './arFilter';

//todo: v10 foundry-vtt-types 
//@ts-ignore
export default class AugmentedRealityVisionDetectionMode extends DetectionMode {

  //@ts-ignore
  static override getDetectionFilter() {
    //@ts-ignore
    return (this._detectionFilter ??= AugmentedRealityVisionFilter.create());
  }
  
    //@ts-ignore
    override _canDetect(visionSource, target) {
      const tgt = target?.document;
      const targetHasIcon =
        tgt instanceof TokenDocument
        && tgt.actor;


      return targetHasIcon || true

    }
  }
  