
import AstralVisionFilter from './astralPerceptionFilter';

export default class AstralPerceptionDetectionMode extends DetectionMode {
    static override getDetectionFilter() {
        return (this._detectionFilter ??= AstralVisionFilter.create());
    }

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
  