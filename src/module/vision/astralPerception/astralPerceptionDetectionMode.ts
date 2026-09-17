
import AstralVisionFilter from './astralPerceptionFilter';
import { FLAGS, SYSTEM_NAME } from '@/module/constants';
import { AstralRegionFlow } from '../astralRegions/AstralRegionFlow';

export default class AstralPerceptionDetectionMode extends foundry.canvas.perception.DetectionMode {
    static override getDetectionFilter() {
        return (this._detectionFilter ??= AstralVisionFilter.create());
    }

    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        const projection = tgt?.getFlag(SYSTEM_NAME, FLAGS.AstralProjection) as { role?: string } | undefined;
        const targetAstralActive = projection?.role === 'form'
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
