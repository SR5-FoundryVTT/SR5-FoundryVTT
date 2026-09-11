import ThermographicVisionFilter from './thermographicFilter';
import type { ThermographicSignature } from '@/module/types/template/Visibility';
import {
    getPhysicalTargetActor,
    hasPhysicalPresence,
    isInvisiblePhysicalTarget,
} from '@/module/vision/physicalVision/physicalDetectionMode';

export default class ThermographicVisionDetectionMode extends foundry.canvas.perception.DetectionMode {
    private static activeSignature: Exclude<ThermographicSignature, 'none'> = 'warm';
    private static readonly filters = new Map<Exclude<ThermographicSignature, 'none'>, ThermographicVisionFilter>();

    static override getDetectionFilter() {
        let filter = this.filters.get(this.activeSignature);
        if (!filter) {
            filter = ThermographicVisionFilter.create({ heatLevel: this.heatLevel(this.activeSignature) });
            this.filters.set(this.activeSignature, filter);
        }
        return filter;
    }
  
    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        if (!hasPhysicalPresence(target)) return false;
        const signature = getPhysicalTargetActor(target)?.system.visibilityChecks.targets.physical.thermographic;
        if (!signature || signature === 'none') return false;
        ThermographicVisionDetectionMode.activeSignature = signature;

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

        return !isInvisiblePhysicalTarget(target) && !isAstralPerceiving;
    }

    private static heatLevel(signature: Exclude<ThermographicSignature, 'none'>) {
        return { cold: 1, warm: 2, hot: 3 }[signature];
    }
}
