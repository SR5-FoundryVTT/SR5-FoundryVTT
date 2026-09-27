import type { ThermographicSignature } from '@/module/types/template/Visibility';
import { type GlowPulse, PulsingGlowOverlayFilter } from '@/module/vision/filters/pulsingGlowFilter';
import { getPhysicalTargetActor } from '@/module/vision/physicalVision/physicalDetectionMode';

export type HeatSignature = Exclude<ThermographicSignature, 'none'>;

interface HeatGlow {
    color: [number, number, number, number];
    /** Halo width in pixels. */
    distance: number;
    innerStrength: number;
    outerStrength: number;
    pulse: GlowPulse | null;
}

/** Hotter signatures glow wider, brighter and faster; a cold one only shows a thin, steady rim. */
const HEAT_GLOWS: Readonly<Record<HeatSignature, HeatGlow>> = {
    cold: { color: [0.25, 0.5, 1.0, 1.0], distance: 6, innerStrength: 2, outerStrength: 2, pulse: null },
    warm: {
        color: [1.0, 0.55, 0.0, 1.0],
        distance: 10,
        innerStrength: 3,
        outerStrength: 3.5,
        pulse: { min: 0.9, max: 1.4, period: 4000 },
    },
    hot: {
        color: [1.0, 0.1, 0.0, 1.0],
        distance: 15,
        innerStrength: 4,
        outerStrength: 6,
        pulse: { min: 0.8, max: 1.6, period: 2500 },
    },
};

/** Foundry's glow outline, with a halo and pulse that follow the target's thermographic signature. */
export class HeatSignatureFilter extends PulsingGlowOverlayFilter {
    private static readonly cache = new Map<HeatSignature, HeatSignatureFilter>();

    /** The shared filter of a signature. */
    static forSignature(signature: HeatSignature) {
        let filter = this.cache.get(signature);
        if (!filter) {
            filter = this.createForSignature(signature);
            this.cache.set(signature, filter);
        }
        return filter;
    }

    /** The filter of the target's signature, or null for a target without one. */
    static forTarget(target: Parameters<typeof getPhysicalTargetActor>[0]) {
        const signature = getPhysicalTargetActor(target)?.system.visibilityChecks.targets.physical.thermographic;
        if (!signature || signature === 'none') return null;
        return this.forSignature(signature);
    }

    private static createForSignature(signature: HeatSignature) {
        const { color, distance, innerStrength, outerStrength, pulse } = HEAT_GLOWS[signature];
        const filter = this.create({ glowColor: color, distance }) as HeatSignatureFilter;
        filter.fitPadding(distance);
        filter.innerStrength = innerStrength;
        filter.outerStrength = outerStrength;
        filter.pulse = pulse;
        filter.animated = !!pulse;
        return filter;
    }
}
