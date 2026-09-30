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
    /** Heat haze rising off the body, or null for a still glow. */
    vapor: HeatVapor | null;
}

interface HeatVapor {
    /** How high the haze rises above the body, in pixels. */
    height: number;
    /** How fast the wisps climb, in noise cells per second. */
    speed: number;
}

interface AccessibleHeatGlow extends Omit<HeatGlow, 'pulse' | 'vapor'> {
    /** Isotherm lines around the silhouette, counting up with the heat so they don't rely on color. */
    bands: 1 | 2 | 3;
}

/**
 * Hotter signatures glow wider and brighter, with more haze rising off them faster; a cold one only shows a thin,
 * steady rim.
 */
export const HEAT_GLOWS: Readonly<Record<HeatSignature, HeatGlow>> = {
    cold: { color: [0.25, 0.5, 1.0, 1.0], distance: 6, innerStrength: 2, outerStrength: 2, pulse: null, vapor: null },
    warm: {
        color: [1.0, 0.55, 0.0, 1.0],
        distance: 10,
        innerStrength: 3,
        outerStrength: 3.5,
        pulse: { min: 0.9, max: 1.4, period: 4000 },
        vapor: { height: 36, speed: 0.5 },
    },
    hot: {
        color: [1.0, 0.1, 0.0, 1.0],
        distance: 15,
        innerStrength: 4,
        outerStrength: 6,
        pulse: { min: 0.8, max: 1.6, period: 2500 },
        vapor: { height: 56, speed: 0.9 },
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

type HeatTarget = Parameters<typeof getPhysicalTargetActor>[0];

/** The target's heat signature, or null for a target that gives off none. */
export const getHeatSignature = (target: HeatTarget): HeatSignature | null => {
    const signature = getPhysicalTargetActor(target)?.system.visibilityChecks.targets.physical.thermographic;
    return signature && signature !== 'none' ? signature : null;
};

/**
 * A heat glow in the manner of Foundry's glow outline, with a halo and pulse that follow the target's thermographic
 * signature. Warm and hot bodies give off heat haze that rises above them. The art is knocked out, since
 * thermographic vision sees heat, not the picture.
 *
 * In photosensitive mode, Foundry's accessibility option, the signature shows as an AccessibleHeatSignatureFilter.
 */
export class HeatSignatureFilter extends PulsingGlowOverlayFilter {
    private static readonly cache = new Map<string, HeatSignatureFilter>();

    static override get defaultUniforms() {
        return {
            ...super.defaultUniforms,
            vaporTime: 0,
            vaporHeight: 0,
            vaporSpeed: 0,
        };
    }

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
    static forTarget(target: HeatTarget) {
        const signature = getHeatSignature(target);
        return signature ? this.forSignature(signature) : null;
    }

    /** A new filter of a signature; forSignature shares them. */
    static createForSignature(signature: HeatSignature): HeatSignatureFilter {
        const glow = HEAT_GLOWS[signature];
        const { vapor } = glow;
        const filter = this.create({
            glowColor: glow.color,
            distance: glow.distance,
            quality: this.qualityForPerformance(),
            vaporHeight: vapor?.height ?? 0,
            vaporSpeed: vapor?.speed ?? 0,
        }) as HeatSignatureFilter;
        filter.configureGlow(glow, Math.max(glow.distance, vapor?.height ?? 0));
        filter.animated ||= !!vapor;
        return filter;
    }

    override apply(...args: Parameters<PulsingGlowOverlayFilter['apply']>) {
        // Seconds, wrapped so the noise keeps its float precision on GPUs; the haze stands still in photosensitive mode.
        const moving = this.animated && !canvas.photosensitiveMode;
        this.uniforms.vaporTime = moving ? (canvas.app!.ticker.lastTime % 1_000_000) / 1000 : 0;
        super.apply(...args);
    }

    static override _createFragmentShader(quality: number, distance: number) {
        return `
    ${this.GLOW_HEADER}
    uniform float vaporTime;
    uniform float vaporHeight;
    uniform float vaporSpeed;

    ${this.CONSTANTS}
    ${this.glowSample(quality, distance)}
    ${this.PRNG}
    ${this.NOISE}
    ${this.FBM(3, 0.5)}

    void main(void) {
      vec4 tex = texture2D(uSampler, vTextureCoord);
      vec2 pixel = vTextureCoord * inputSize.xy;

      // The glow, as Foundry's outline draws it.
      float coverage = glowSample(vTextureCoord).x;
      float outside = 1.0 - smoothstep(0.35, 1.0, tex.a);
      float outer = min(1.0, coverage * outerStrength) * outside;
      float inner = min(1.0, (1.0 - coverage) * innerStrength * smoothstep(0.6, 1.0, tex.a));

      // The haze: each point takes up the body below it, swaying more and fading the higher it is, so a plume rises
      // off the head and shoulders. The noise scrolls up over time, so the wisps climb and break apart.
      float vapor = 0.0;
      if (vaporHeight > 0.0) {
        float t = vaporTime * vaporSpeed;
        for (int k = 1; k <= 8; k++) {
          float h = float(k) / 8.0;
          float sway = (fbm(pixel / 16.0 + vec2(h * 1.3, t)) - 0.5) * vaporHeight * 0.6 * h;
          vec2 below = vTextureCoord + vec2(sway, h * vaporHeight) * inputSize.zw;
          vapor += texture2D(uSampler, below).a * getClip(below) * (1.0 - h);
        }
        // The weights add up to 3.5; right above the body most of them land on it.
        float wisps = smoothstep(0.2, 0.7, fbm(pixel / 10.0 + vec2(1.7, t * 1.3)));
        vapor = clamp(vapor / 2.0 * wisps, 0.0, 1.0) * outside;
      }

      float glowAlpha = clamp(max(outer, vapor) + inner, 0.0, 1.0);
      gl_FragColor = vec4(glowColor.rgb * glowAlpha, glowAlpha) * alpha;
    }`;
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
        const glow = ACCESSIBLE_HEAT_GLOWS[signature];
        const filter = this.create({
            glowColor: glow.color,
            distance: glow.distance,
            quality: this.qualityForPerformance(),
            bands: glow.bands,
        }) as AccessibleHeatSignatureFilter;
        return filter.configureGlow(glow);
    }

    static override _createFragmentShader(quality: number, distance: number) {
        return `
    ${this.GLOW_HEADER}
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
