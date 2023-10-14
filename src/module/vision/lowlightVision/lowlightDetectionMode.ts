
import LowLightVisionFilter from './lowlightFilter';

//todo: v10 foundry-vtt-types 
//@ts-ignore
export default class LowlightVisionDetectionMode extends DetectionMode {

  //@ts-ignore
  static override getDetectionFilter() {
    //@ts-ignore
    return (this._detectionFilter ??= LowLightVisionFilter.create());
  }

  
    //@ts-ignore
    override _canDetect(visionSource, target) {
      const tgt = target?.document;
      const targetIsVisible =
        tgt instanceof TokenDocument
        && tgt.actor;


      return targetIsVisible

    }
  }
  