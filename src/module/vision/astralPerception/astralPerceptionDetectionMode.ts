
import AstralVisionFilter from './astralPerceptionFilter';

//@ts-expect-error // TODO: foundry-vtt-types v10
export default class AstralPerceptionDetectionMode extends DetectionMode {

  //@ts-expect-error // TODO: foundry-vtt-types v10
  static override getDetectionFilter() {
    //@ts-expect-error // TODO: foundry-vtt-types v10
    return (this._detectionFilter ??= AstralVisionFilter.create());
  }

  
    //@ts-expect-error // TODO: foundry-vtt-types v10
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
  