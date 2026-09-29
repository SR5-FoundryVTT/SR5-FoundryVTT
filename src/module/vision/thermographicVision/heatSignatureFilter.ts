import type { ThermographicSignature } from '@/module/types/template/Visibility';
import { type GlowPulse, PulsingGlowOverlayFilter } from '@/module/vision/filters/pulsingGlowFilter';
import { getPhysicalTargetActor } from '@/module/vision/physicalVision/physicalDetectionMode';

export type HeatSignature = Exclude<ThermographicSignature, 'none'>;

interface HeatGlow {
    /**
     * Heat color. The palette gets brighter as it gets hotter, so the signatures read in any color vision and in
     * greyscale.
     */
    color: [number, number, number, number];
    /** Halo width in pixels. */
    distance: number;
    innerStrength: number;
    outerStrength: number;
    /** Isotherm lines around the silhouette, counting up with the heat so they don't rely on color. */
    bands: 1 | 2 | 3;
    pulse: GlowPulse | null;
}

/** Hotter signatures glow wider, brighter and with more isotherms; a cold one is a dim, steady rim. */
export const HEAT_GLOWS: Readonly<Record<HeatSignature, HeatGlow>> = {
    cold: { color: [0.3, 0.45, 0.95, 1.0], distance: 8, innerStrength: 1, outerStrength: 1.5, bands: 1, pulse: null },
    warm: {
        color: [1.0, 0.55, 0.15, 1.0],
        distance: 12,
        innerStrength: 1.5,
        outerStrength: 2.5,
        bands: 2,
        pulse: { min: 0.9, max: 1.2, period: 4000 },
    },
    hot: {
        color: [1.0, 0.95, 0.65, 1.0],
        distance: 16,
        innerStrength: 2,
        outerStrength: 4,
        bands: 3,
        pulse: { min: 0.85, max: 1.3, period: 2500 },
    },
};

/**
 * How thermographic vision shows a heat source: its silhouette filled with heat, hottest at the core, inside a
 * faint halo crossed by isotherm lines. It replaces the sprite, since thermographic vision sees heat, not the
 * picture.
 */
export class HeatSignatureFilter extends PulsingGlowOverlayFilter {
    private static readonly cache = new Map<HeatSignature, HeatSignatureFilter>();

    static override get defaultUniforms() {
        return {
            ...super.defaultUniforms,
            knockout: false,
            bands: 1,
        };
    }

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
        const { color, distance, innerStrength, outerStrength, bands, pulse } = HEAT_GLOWS[signature];
        const filter = this.create({
            glowColor: color,
            distance,
            quality: this.qualityForPerformance(),
            bands,
        }) as HeatSignatureFilter;
        filter.fitPadding(distance);
        filter.innerStrength = innerStrength;
        filter.outerStrength = outerStrength;
        filter.pulse = pulse;
        filter.animated = !!pulse;
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

      // The body: dim at the edges, the heat color at the core.
      float core = smoothstep(0.45, 1.0, coverage);
      float fill = tex.a * clamp(0.35 + core * innerStrength * 0.5, 0.0, 1.0);
      vec3 body = glowColor.rgb * mix(0.35, 1.0, core);

      // A faint halo, crossed by one isotherm line per step of heat, 4 pixels apart.
      float outside = 1.0 - smoothstep(0.35, 1.0, tex.a);
      float falloff = 1.0 - clamp((dist - 1.0) / DIST, 0.0, 1.0);
      float halo = falloff * clamp(outerStrength * 0.25, 0.0, 1.0) * 0.45;
      float lines = step(0.5, bands) * lineAt(dist, 3.0, 0.6)
                  + step(1.5, bands) * lineAt(dist, 7.0, 0.6)
                  + step(2.5, bands) * lineAt(dist, 11.0, 0.6);
      float lineAlpha = clamp(lines, 0.0, 1.0) * mix(0.6, 1.0, falloff);
      float haloAlpha = min(1.0 - fill, clamp(max(halo, lineAlpha) * outside, 0.0, 1.0));

      gl_FragColor = (vec4(body * fill, fill) + vec4(glowColor.rgb * haloAlpha, haloAlpha)) * alpha;
    }`;
    }
}
