
import AugmentedRealityVisionFilter from './arFilter';

//todo: v10 foundry-vtt-types 
//@ts-expect-error
export default class AugmentedRealityVisionDetectionMode extends DetectionMode {

  //@ts-expect-error
  static override getDetectionFilter() {
    //@ts-expect-error
    return (this._detectionFilter ??= AugmentedRealityVisionFilter.create());
  }
  
    //@ts-expect-error
    override _canDetect(visionSource, target) {
      const tgt = target?.document;
      const targetHasIcon =
        tgt instanceof TokenDocument
        && tgt.actor?.system.visibilityChecks.matrix.hasIcon;

      const targetIsNotRunningSilent = !tgt.actor?.system.visibilityChecks.matrix.runningSilent

      return targetHasIcon || targetIsNotRunningSilent
    }
  }
  