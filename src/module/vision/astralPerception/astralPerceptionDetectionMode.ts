
import { resolveDetectionModeRange } from '../detectionRange';
import { isBlockedBySR5Walls, resolveVisionSourceOrigin } from '../losHelpers';
import { isVisionSourceMode } from '../visionModeState';
import AstralVisionFilter from './astralPerceptionFilter';

export default class AstralPerceptionDetectionMode extends foundry.canvas.perception.DetectionMode {
    static override getDetectionFilter() {
        return (this._detectionFilter ??= AstralVisionFilter.create());
    }

    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        if (!tgt) return false;

        const targetAstralActive = !!tgt?.actor?.system.visibilityChecks.astral.astralActive;

        const targetHasAura = !!tgt?.actor?.system.visibilityChecks.astral.hasAura;

        const targetAffectedBySpell = !!tgt?.actor?.system.visibilityChecks.astral.affectedBySpell;

        const isAstralPerceiving = isVisionSourceMode(visionSource, 'astralPerception');

        return (targetHasAura || targetAstralActive || targetAffectedBySpell) && isAstralPerceiving;
    }

    override _testRange(
        ...[visionSource, mode, target, test]: Parameters<foundry.canvas.perception.DetectionMode['_testRange']>
    ) {
        const range = resolveDetectionModeRange(visionSource, mode);
        return super._testRange(visionSource, { ...mode, range }, target, test);
    }

    override _testLOS(
        ...[visionSource, mode, target, test]: Parameters<foundry.canvas.perception.DetectionMode['_testLOS']>
    ) {
        if (!super._testLOS(visionSource, mode, target, test)) {
            return false;
        }

        const origin = resolveVisionSourceOrigin(visionSource);

        return !isBlockedBySR5Walls(origin, test.point, 'astral');
    }
}
  