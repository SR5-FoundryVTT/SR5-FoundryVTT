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

interface AccessibleHeatGlow extends Omit<HeatGlow, 'pulse'> {
    /** Isotherm lines around the silhouette, counting up with the heat so they don't rely on color. */
    bands: 1 | 2 | 3;
}

/** Hotter signatures glow wider, brighter and faster; a cold one only shows a thin, steady rim. */
export const HEAT_GLOWS: Readonly<Record<HeatSignature, HeatGlow>> = {
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

/**
 * The heat glows of photosensitive mode, where nothing pulses. The palette gets brighter as it gets hotter and the
 * isotherms count up, so the signatures read in any color vision and in greyscale.
 */
export const ACCESSIBLE_HEAT_GLOWS: Readonly<Record<HeatSignature, AccessibleHeatGlow>> = {
    cold: { color: [0.3, 0.45, 0.95, 1.0], distance: 8, innerStrength: 2, outerStrength: 1.5, bands: 1 },
    warm: { color: [1.0, 0.55, 0.15, 1.0], distance: 12, innerStrength: 3, outerStrength: 2.5, bands: 2 },
    hot: { color: [1.0, 0.95, 0.65, 1.0], distance: 16, innerStrength: 4, outerStrength: 4, bands: 3 },
};

/**
 * Foundry's glow outline, with a halo and pulse that follow the target's thermographic signature. The art is knocked
 * out, since thermographic vision sees heat, not the picture.
 *
 * In photosensitive mode, Foundry's accessibility option, the signature shows as an AccessibleHeatSignatureFilter.
 */
export class HeatSignatureFilter extends PulsingGlowOverlayFilter {
    private static readonly cache = new Map<string, HeatSignatureFilter>();

    /** The shared filter of a signature. */
    static forSignature(signature: HeatSignature, accessible = !!canvas.photosensitiveMode) {
        const key = `${signature}:${accessible}`;
        let filter = HeatSignatureFilter.cache.get(key);
        if (!filter) {
            filter = accessible
                ? AccessibleHeatSignatureFilter.createForSignature(signature)
                : HeatSignatureFilter.createForSignature(signature);
            HeatSignatureFilter.cache.set(key, filter);
        }
        return filter;
    }

    /** The filter of the target's signature, or null for a target without one. */
    static forTarget(target: Parameters<typeof getPhysicalTargetActor>[0]) {
        const signature = getPhysicalTargetActor(target)?.system.visibilityChecks.targets.physical.thermographic;
        if (!signature || signature === 'none') return null;
        return this.forSignature(signature);
    }

    /** A new filter of a signature; forSignature shares them. */
    static createForSignature(signature: HeatSignature): HeatSignatureFilter {
        const { color, distance, innerStrength, outerStrength, pulse } = HEAT_GLOWS[signature];
        const filter = this.create({
            glowColor: color,
            distance,
            quality: this.qualityForPerformance(),
        }) as HeatSignatureFilter;
        filter.fitPadding(distance);
        filter.innerStrength = innerStrength;
        filter.outerStrength = outerStrength;
        filter.pulse = pulse;
        filter.animated = !!pulse;
        return filter;
    }
}

/**
 * The heat look of photosensitive mode: a heat rim along the inside of the silhouette, in a faint halo crossed by
 * one to three isotherm lines. It doesn't pulse.
 */
export class AccessibleHeatSignatureFilter extends HeatSignatureFilter {
    static override get defaultUniforms() {
        return {
            ...super.defaultUniforms,
            bands: 1,
        };
    }

    static override createForSignature(signature: HeatSignature) {
        const { color, distance, innerStrength, outerStrength, bands } = ACCESSIBLE_HEAT_GLOWS[signature];
        const filter = this.create({
            glowColor: color,
            distance,
            quality: this.qualityForPerformance(),
            bands,
        }) as AccessibleHeatSignatureFilter;
        filter.fitPadding(distance);
        filter.innerStrength = innerStrength;
        filter.outerStrength = outerStrength;
        filter.animated = false;
        return filter;
    }

    static override _createFragmentShader(quality: number, distance: number) {
        return `
    precision ${PIXI.Program.defaultFragmentPrecision} float;
    varying vec2 vTextureCoord;

    uniform sampler2D uSampler;
    uniform float innerStrength;
    uniform float outerStrength;
    uniform float alpha;
    uniform vec4 glowColor;
    uniform vec4 inputSize;
    uniform vec4 inputClamp;
    uniform float bands;

    ${this.CONSTANTS}
    ${this.glowSample(quality, distance)}

    void main(void) {
      vec2 glow = glowSample(vTextureCoord);
      float coverage = glow.x;
      float dist = glow.y;
      vec4 tex = texture2D(uSampler, vTextureCoord);

      // Inside: a heat rim along the edge that fades inward, like Foundry's inner glow. The art is not drawn.
      float rim = min(1.0, (1.0 - coverage) * innerStrength * smoothstep(0.6, 1.0, tex.a));

      // Outside: a faint halo, crossed by one isotherm line per step of heat, 4 pixels apart.
      float outside = 1.0 - smoothstep(0.35, 1.0, tex.a);
      float falloff = 1.0 - clamp((dist - 1.0) / DIST, 0.0, 1.0);
      float halo = falloff * clamp(outerStrength * 0.25, 0.0, 1.0) * 0.45;
      float lines = step(0.5, bands) * lineAt(dist, 3.0, 0.6)
                  + step(1.5, bands) * lineAt(dist, 7.0, 0.6)
                  + step(2.5, bands) * lineAt(dist, 11.0, 0.6);
      float lineAlpha = clamp(lines, 0.0, 1.0) * mix(0.6, 1.0, falloff);
      float glowAlpha = clamp(max(halo, lineAlpha) * outside + rim, 0.0, 1.0);

      gl_FragColor = vec4(glowColor.rgb * glowAlpha, glowAlpha) * alpha;
    }`;
    }
}
