
import AstralVisionFilter from './astralPerceptionFilter';
import { AstralRegionFlow } from '../astralRegions/AstralRegionFlow';
import { isAstralForm } from '../astralProjection/AstralProjectionState';

export default class AstralPerceptionDetectionMode extends foundry.canvas.perception.DetectionMode {
    static override getDetectionFilter() {
        return (this._detectionFilter ??= AstralVisionFilter.create());
    }

    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        const targetAstralActive = isAstralForm(tgt)
            || !!tgt?.actor?.system.visibilityChecks.targets.astral.astralActive;

        const targetHasAura = !!tgt?.actor?.system.visibilityChecks.targets.astral.hasAura;

        const targetAffectedBySpell = !!tgt?.actor?.system.visibilityChecks.targets.astral.affectedBySpell;

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

        return (targetHasAura || targetAstralActive || targetAffectedBySpell) && isAstralPerceiving;
    }

    override _testPoint(...args: Parameters<foundry.canvas.perception.DetectionMode['_testPoint']>) {
        if (!super._testPoint(...args)) return false;
        const [visionSource, , target, test] = args;
        return !AstralRegionFlow.blocksDetection(visionSource, target, test);
    }
}
