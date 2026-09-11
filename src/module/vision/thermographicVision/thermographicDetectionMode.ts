import type { ThermographicSignature } from '@/module/types/template/Visibility';
import {
    getPhysicalTargetActor,
    hasPhysicalPresence,
    isAstralVisionSource,
    isInvisiblePhysicalTarget,
} from '@/module/vision/physicalVision/physicalDetectionMode';

export default class ThermographicVisionDetectionMode extends foundry.canvas.perception.DetectionMode {
    private static readonly GLOW_COLORS: Readonly<
        Record<Exclude<ThermographicSignature, 'none'>, [number, number, number, number]>
    > = {
        cold: [0.25, 0.5, 1.0, 1.0],
        warm: [1.0, 0.55, 0.0, 1.0],
        hot: [1.0, 0.1, 0.0, 1.0],
    };
    private static readonly filters = new Map<Exclude<ThermographicSignature, 'none'>, PIXI.Filter>();
    private static pendingSignature: Exclude<ThermographicSignature, 'none'> | null = null;

    static override getDetectionFilter() {
        const signature = this.pendingSignature;
        this.pendingSignature = null;
        if (!signature) return undefined;

        let filter = this.filters.get(signature);
        if (!filter) {
            filter = foundry.canvas.rendering.filters.GlowOverlayFilter.create({
                glowColor: this.GLOW_COLORS[signature],
            });
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
