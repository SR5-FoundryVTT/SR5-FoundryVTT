import {
    getPhysicalTargetActor,
    hasPhysicalPresence,
    isAstralVisionSource,
    isInvisiblePhysicalTarget,
} from '@/module/vision/physicalVision/physicalDetectionMode';
import { type HeatSignature, HeatSignatureFilter } from './heatSignatureFilter';

export default class ThermographicVisionDetectionMode extends foundry.canvas.perception.DetectionMode {
    private static readonly filters = new Map<HeatSignature, PIXI.Filter>();
    private static pendingSignature: HeatSignature | null = null;

    static override getDetectionFilter() {
        const signature = this.pendingSignature;
        this.pendingSignature = null;
        if (!signature) return undefined;

        let filter = this.filters.get(signature);
        if (!filter) {
            filter = HeatSignatureFilter.forSignature(signature);
            this.filters.set(signature, filter);
        }
        return filter;
    }

    override _canDetect(...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>) {
        ThermographicVisionDetectionMode.pendingSignature = null;
        if (!hasPhysicalPresence(target)) return false;
        const signature = getPhysicalTargetActor(target)?.system.visibilityChecks.targets.physical.thermographic;
        if (!signature || signature === 'none') return false;
        if (isInvisiblePhysicalTarget(target) || isAstralVisionSource(visionSource)) return false;

        ThermographicVisionDetectionMode.pendingSignature = signature;
        return true;
    }
}
