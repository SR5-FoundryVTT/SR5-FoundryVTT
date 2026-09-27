import { type GlowPulse, PulsingGlowOverlayFilter } from '@/module/vision/filters/pulsingGlowFilter';
import {
    ASTRAL_TIERS,
    type AstralTier,
    getAstralSignature,
    MAX_ESSENCE_BUCKET,
} from './astralSignature';

type Color = [number, number, number];

interface AuraLook {
    /** Aura color. */
    glow: Color;
    /** Halo width in pixels. */
    distance: number;
    innerStrength: number;
    outerStrength: number;
    /** A brighter band hugging the silhouette, for beings active on the astral plane. */
    rim: number;
    /** Added to the sprite's saturation; -1 is fully grey. */
    saturation: number;
    brightness: number;
    tint: Color;
    alpha: number;
    pulse: GlowPulse | null;
    /** Whether a lower Essence dims the aura. Astral forms have no Essence to lose. */
    followsEssence: boolean;
}

const WHITE: Color = [1, 1, 1];

/** The least an aura dims to at Essence 1, so heavily augmented beings stay visible. */
const MIN_ESSENCE_FACTOR = 0.35;

/**
 * SR5#312: non-living things are grey shadows, living auras shine in color, and astral forms are brighter
 * still. Awakened auras carry a rim, the look of beings active on the astral plane.
 */
const AURA_LOOKS: Readonly<Record<AstralTier, AuraLook>> = {
    shadow: {
        glow: [0.8, 0.85, 0.95],
        distance: 2,
        innerStrength: 0,
        outerStrength: 0,
        rim: 0,
        saturation: -1,
        brightness: 0.6,
        tint: [0.8, 0.85, 0.95],
        alpha: 0.45,
        pulse: null,
        followsEssence: false,
    },
    aura: {
        glow: [1.0, 0.8, 0.45],
        distance: 8,
        innerStrength: 1.5,
        outerStrength: 2.5,
        rim: 0,
        saturation: 0.15,
        brightness: 0.9,
        tint: WHITE,
        alpha: 1,
        pulse: { min: 0.85, max: 1.15, period: 5000 },
        followsEssence: true,
    },
    awakened: {
        glow: [0.7, 0.45, 1.0],
        distance: 12,
        innerStrength: 2,
        outerStrength: 4,
        rim: 0.8,
        saturation: 0.25,
        brightness: 1,
        tint: WHITE,
        alpha: 1,
        pulse: { min: 0.8, max: 1.25, period: 3500 },
        followsEssence: true,
    },
    form: {
        glow: [0.55, 0.95, 1.0],
        distance: 14,
        innerStrength: 3,
        outerStrength: 6,
        rim: 1,
        saturation: 0.4,
        brightness: 1.25,
        tint: WHITE,
        alpha: 1,
        pulse: { min: 0.9, max: 1.3, period: 3000 },
        followsEssence: false,
    },
};

/**
 * How a token looks to astral perception: its sprite, recolored for its astral tier, inside an aura.
 *
 * Detection filters render the token alone with this filter, so it draws the sprite itself rather than
 * knocking it out like Foundry's glow. The glow loop is Foundry's GlowOverlayFilter, itself based on
 * https://github.com/pixijs/filters/tree/main/filters/glow (MIT).
 */
export class AstralAuraFilter extends PulsingGlowOverlayFilter {
    private static readonly cache = new Map<number, AstralAuraFilter>();

    tier: AstralTier = 'shadow';

    static override get defaultUniforms() {
        return {
            ...super.defaultUniforms,
            knockout: false,
            spriteTint: WHITE,
            spriteSaturation: 0,
            spriteBrightness: 1,
            spriteAlpha: 1,
            rimStrength: 0,
        };
    }

    /** The shared filter of a tier at an Essence bucket. */
    static forSignature(tier: AstralTier, bucket = MAX_ESSENCE_BUCKET) {
        const look = AURA_LOOKS[tier];
        const effectiveBucket = look.followsEssence
            ? Math.min(MAX_ESSENCE_BUCKET, Math.max(1, Math.round(bucket)))
            : MAX_ESSENCE_BUCKET;
        const key = ASTRAL_TIERS.indexOf(tier) * (MAX_ESSENCE_BUCKET + 1) + effectiveBucket;
        let filter = this.cache.get(key);
        if (!filter) {
            filter = this.createForSignature(tier, effectiveBucket);
            this.cache.set(key, filter);
        }
        return filter;
    }

    /**
     * The filter showing a target's astral signature.
     *
     * @param fallback Tier of a target that has none, like a sprite showing because its token is controlled.
     */
    static forTarget(target: Parameters<typeof getAstralSignature>[0], fallback: AstralTier | null = null) {
        const signature = getAstralSignature(target, fallback);
        return signature ? this.forSignature(signature.tier, signature.bucket) : null;
    }

    private static createForSignature(tier: AstralTier, bucket: number) {
        const look = AURA_LOOKS[tier];
        const essence = look.followsEssence ? Math.max(MIN_ESSENCE_FACTOR, bucket / MAX_ESSENCE_BUCKET) : 1;
        const filter = this.create({
            distance: look.distance,
            glowColor: [...look.glow, 0.5 + 0.5 * essence],
            spriteTint: look.tint,
            spriteSaturation: look.saturation,
            spriteBrightness: look.brightness,
            spriteAlpha: look.alpha,
            rimStrength: look.rim * essence,
        }) as AstralAuraFilter;
        filter.fitPadding(look.distance);
        filter.tier = tier;
        filter.innerStrength = look.innerStrength * essence;
        filter.outerStrength = look.outerStrength * essence;
        filter.pulse = look.pulse;
        filter.animated = !!look.pulse;
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
    uniform vec3 spriteTint;
    uniform float spriteSaturation;
    uniform float spriteBrightness;
    uniform float spriteAlpha;
    uniform float rimStrength;

    ${this.CONSTANTS}
    const float DIST = ${distance.toFixed(0)}.0;
    const float ANGLE_STEP_SIZE = min(${(1 / quality / distance).toFixed(7)}, PI * 2.0);
    const float ANGLE_STEP_NUM = ceil(PI * 2.0 / ANGLE_STEP_SIZE);
    const float MAX_TOTAL_ALPHA = ANGLE_STEP_NUM * DIST * (DIST + 1.0) / 2.0;

    ${this.PERCEIVED_BRIGHTNESS}

    float getClip(in vec2 uv) {
      return step(3.5,
       step(inputClamp.x, uv.x) +
       step(inputClamp.y, uv.y) +
       step(uv.x, inputClamp.z) +
       step(uv.y, inputClamp.w));
    }

    void main(void) {
      vec2 px = inputSize.zw;
      float totalAlpha = 0.0;
      for (float angle = 0.0; angle < PI * 2.0; angle += ANGLE_STEP_SIZE) {
        vec2 direction = vec2(cos(angle), sin(angle)) * px;
        for (float curDistance = 0.0; curDistance < DIST; curDistance++) {
          vec2 displaced = vTextureCoord + direction * (curDistance + 1.0);
          vec4 sampled = texture2D(uSampler, displaced) * getClip(displaced);
          totalAlpha += (DIST - curDistance) * smoothstep(0.5, 1.0, sampled.a);
        }
      }
      float coverage = totalAlpha / MAX_TOTAL_ALPHA;

      // The sprite, recolored for its tier. Textures are premultiplied, so unmultiply before recoloring.
      vec4 tex = texture2D(uSampler, vTextureCoord);
      vec3 rgb = tex.a > 0.0 ? tex.rgb / tex.a : vec3(0.0);
      rgb = mix(vec3(perceivedBrightness(rgb)), rgb, 1.0 + spriteSaturation);
      rgb = clamp(rgb * spriteTint * spriteBrightness, 0.0, 1.0);
      float a = tex.a * spriteAlpha;
      vec4 sprite = vec4(rgb * a, a);

      // The aura seeps into the silhouette's edges...
      float inner = min(1.0, (1.0 - coverage) * innerStrength * smoothstep(0.6, 1.0, tex.a)) * glowColor.a;
      sprite = mix(sprite, vec4(glowColor.rgb * a, a), inner);

      // ...and shines around it, with a brighter band close to the silhouette for astrally active beings.
      float outside = 1.0 - smoothstep(0.35, 1.0, tex.a);
      float rim = rimStrength * smoothstep(0.25, 0.45, coverage);
      float glowAlpha = min(1.0 - sprite.a, clamp((coverage * outerStrength + rim) * outside, 0.0, 1.0));
      glowAlpha *= glowColor.a;

      gl_FragColor = (sprite + vec4(glowColor.rgb * glowAlpha, glowAlpha)) * alpha;
    }`;
    }
}
