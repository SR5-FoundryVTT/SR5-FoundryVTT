
import AstralVisionFilter from './astralPerceptionFilter';

//todo: v10 foundry-vtt-types 
//@ts-expect-error
export default class AstralPerceptionDetectionMode extends DetectionMode {

  //@ts-expect-error
  static override getDetectionFilter() {
    //@ts-expect-error
    return (this._detectionFilter ??= AstralVisionFilter.create());
  }

  
    //@ts-expect-error
    override _canDetect(visionSource, target) {
      const tgt = target?.document;
      const targetAstralActive =
        tgt instanceof TokenDocument
        && tgt.actor?.system.visibilityChecks.astral.astralActive;

      const targetHasAura =
        tgt instanceof TokenDocument
        && tgt.actor?.system.visibilityChecks.astral.hasAura;

      const targetAffectedBySpell = tgt.actor?.system.visibilityChecks.astral.affectedBySpell;

      const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

      return (targetHasAura || targetAstralActive || targetAffectedBySpell) && isAstralPerceiving

    }
  }
  