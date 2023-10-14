
import AstralVisionFilter from './astralPerceptionFilter';

//todo: v10 foundry-vtt-types 
//@ts-ignore
export default class AstralPerceptionDetectionMode extends DetectionMode {

  //@ts-ignore
  static override getDetectionFilter() {
    //@ts-ignore
    return (this._detectionFilter ??= AstralVisionFilter.create());
  }

  
    //@ts-ignore
    override _canDetect(visionSource, target) {
      const tgt = target?.document;
      const targetAstralActive =
        tgt instanceof TokenDocument
        && tgt.actor;


      const targetAffectedBySpell = false;

      const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

      return (targetAstralActive || targetAffectedBySpell) && isAstralPerceiving

    }
  }
  