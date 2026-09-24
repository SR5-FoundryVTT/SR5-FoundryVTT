import type { ThermographicSignature } from '@/module/types/template/Visibility';

export type HeatSignature = Exclude<ThermographicSignature, 'none'>;

interface HeatPulse {
    min: number;
    max: number;
    /** Milliseconds per cycle. */
    period: number;
}

interface HeatGlow {
    color: [number, number, number, number];
    /** Halo width in pixels. */
    distance: number;
    innerStrength: number;
    outerStrength: number;
    pulse: HeatPulse | null;
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
export class HeatSignatureFilter extends foundry.canvas.rendering.filters.GlowOverlayFilter {
    pulse: HeatPulse | null = null;

    static forSignature(signature: HeatSignature) {
        const { color, distance, innerStrength, outerStrength, pulse } = HEAT_GLOWS[signature];
        const filter = this.create({ glowColor: color, distance });
        // Foundry keeps a 6 px padding, which would clip a wider halo.
        filter.padding = Math.max(filter.padding, distance);
        filter.innerStrength = innerStrength;
        filter.outerStrength = outerStrength;
        filter.pulse = pulse;
        filter.animated = !!pulse;
        return filter;
    }

    override apply(
        ...[filterManager, input, output, clear]: Parameters<foundry.canvas.rendering.filters.GlowOverlayFilter['apply']>
    ) {
        let strength = canvas.stage!.worldTransform.d;
        if (this.animated && this.pulse && !canvas.photosensitiveMode) {
            const { min, max, period } = this.pulse;
            strength *= Math.oscillation(min, max, canvas.app!.ticker.lastTime, period);
        }
        this.uniforms.outerStrength = this.outerStrength * strength;
        this.uniforms.innerStrength = this.innerStrength * strength;
        filterManager.applyFilter(this, input, output, clear);
    }
}
