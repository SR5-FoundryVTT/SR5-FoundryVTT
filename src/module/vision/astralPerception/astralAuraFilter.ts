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
    /** Halo width in pixels of a full aura. */
    distance: number;
    innerStrength: number;
    outerStrength: number;
    /**
     * Bright rings around the silhouette, at fixed distances from it. Their count tells the tiers apart without
     * relying on color: none for a living aura, one for an Awakened aura, two for an astral form.
     */
    rings: 0 | 1 | 2;
    /** Added to the sprite's saturation; -1 is fully grey. */
    saturation: number;
    brightness: number;
    tint: Color;
    alpha: number;
    pulse: GlowPulse | null;
    /** Whether a lower Essence thins the aura. Astral forms have no Essence to lose. */
    followsEssence: boolean;
}

export interface AuraOptions {
    /**
     * Draw only the aura around a token seen physically, leaving its sprite as it is: the astral plane overlaid on
     * the physical one while perceiving (SR5#312).
     */
    overlay?: boolean;
}

const WHITE: Color = [1, 1, 1];

/** The least an aura dims to at Essence 1, so heavily augmented beings stay visible. */
const MIN_ESSENCE_FACTOR = 0.35;

/** The narrowest halo, in pixels, so a thin aura still reads as a halo. */
const MIN_HALO_DISTANCE = 5;

/** Brightness of the rings on top of the aura color, towards white. */
const RING_WHITENESS = 0.45;

/**
 * SR5#312: non-living things are grey shadows, living auras shine in color, and astral forms are brighter
 * still. Tiers also differ in ring count and brightness, so they read in any color vision and in greyscale.
 *
 * Seen only astrally, a being's sprite takes on the color of its aura, so it doesn't pass for being seen
 * physically.
 */
const AURA_LOOKS: Readonly<Record<AstralTier, AuraLook>> = {
    shadow: {
        glow: [0.8, 0.85, 0.95],
        distance: 2,
        innerStrength: 0,
        outerStrength: 0,
        rings: 0,
        saturation: -1,
        brightness: 0.6,
        tint: [0.8, 0.85, 0.95],
        alpha: 0.45,
        pulse: null,
        followsEssence: false,
    },
    aura: {
        glow: [1.0, 0.8, 0.45],
        distance: 12,
        innerStrength: 1.5,
        outerStrength: 2.5,
        rings: 0,
        saturation: -0.3,
        brightness: 1,
        tint: [1.0, 0.88, 0.7],
        alpha: 1,
        pulse: { min: 0.85, max: 1.15, period: 5000 },
        followsEssence: true,
    },
    awakened: {
        glow: [0.7, 0.45, 1.0],
        distance: 14,
        innerStrength: 2,
        outerStrength: 3.5,
        rings: 1,
        saturation: -0.3,
        brightness: 1.05,
        tint: [0.88, 0.78, 1.0],
        alpha: 1,
        pulse: { min: 0.8, max: 1.25, period: 3500 },
        followsEssence: true,
    },
    form: {
        glow: [0.55, 0.95, 1.0],
        distance: 18,
        innerStrength: 3,
        outerStrength: 5,
        rings: 2,
        saturation: 0,
        brightness: 1.2,
        tint: [0.8, 1.0, 1.0],
        alpha: 1,
        pulse: { min: 0.9, max: 1.3, period: 3000 },
        followsEssence: false,
    },
};

/**
 * How a token looks to astral sight: its sprite, recolored for its astral tier, inside an aura with the tier's
 * rings. As an overlay it leaves the sprite alone and only adds the aura.
 *
 * Detection filters render the token alone with this filter, so it draws the sprite itself rather than
 * knocking it out like Foundry's glow.
 */
export class AstralAuraFilter extends PulsingGlowOverlayFilter {
    private static readonly cache = new Map<number, AstralAuraFilter>();

    tier: AstralTier = 'shadow';
    overlay = false;

    static override get defaultUniforms() {
        return {
            ...super.defaultUniforms,
            knockout: false,
            spriteTint: WHITE,
            spriteSaturation: 0,
            spriteBrightness: 1,
            spriteAlpha: 1,
            rings: 0,
            ringColor: WHITE,
        };
    }

    /** The shared filter of a tier at an Essence bucket. */
    static forSignature(tier: AstralTier, bucket = MAX_ESSENCE_BUCKET, { overlay = false }: AuraOptions = {}) {
        const look = AURA_LOOKS[tier];
        const effectiveBucket = look.followsEssence
            ? Math.min(MAX_ESSENCE_BUCKET, Math.max(1, Math.round(bucket)))
            : MAX_ESSENCE_BUCKET;
        const key = (ASTRAL_TIERS.indexOf(tier) * (MAX_ESSENCE_BUCKET + 1) + effectiveBucket) * 2 + Number(overlay);
        let filter = this.cache.get(key);
        if (!filter) {
            filter = this.createForSignature(tier, effectiveBucket, overlay);
            this.cache.set(key, filter);
        }
        return filter;
    }

    /**
     * The filter showing a target's astral signature.
     *
     * @param fallback Tier of a target that has none, like a sprite showing because its token is controlled.
     */
    static forTarget(
        target: Parameters<typeof getAstralSignature>[0],
        fallback: AstralTier | null = null,
        options: AuraOptions = {},
    ) {
        const signature = getAstralSignature(target, fallback);
        return signature ? this.forSignature(signature.tier, signature.bucket, options) : null;
    }

    private static createForSignature(tier: AstralTier, bucket: number, overlay: boolean) {
        const look = AURA_LOOKS[tier];
        const essence = look.followsEssence ? Math.max(MIN_ESSENCE_FACTOR, bucket / MAX_ESSENCE_BUCKET) : 1;
        // Cyberware narrows the halo as well as dimming it, so Essence doesn't rest on brightness alone.
        const distance = look.outerStrength
            ? Math.max(MIN_HALO_DISTANCE, Math.round(look.distance * (0.5 + 0.5 * essence)))
            : look.distance;
        const filter = this.create({
            distance,
            quality: this.qualityForPerformance(),
            glowColor: [...look.glow, 0.5 + 0.5 * essence],
            spriteTint: overlay ? WHITE : look.tint,
            spriteSaturation: overlay ? 0 : look.saturation,
            spriteBrightness: overlay ? 1 : look.brightness,
            spriteAlpha: overlay ? 0 : look.alpha,
            rings: look.rings,
            ringColor: look.glow.map(channel => channel + (1 - channel) * RING_WHITENESS),
        }) as AstralAuraFilter;
        filter.fitPadding(distance);
        filter.tier = tier;
        filter.overlay = overlay;
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
    uniform float rings;
    uniform vec3 ringColor;

    ${this.CONSTANTS}
    ${this.PERCEIVED_BRIGHTNESS}
    ${this.glowSample(quality, distance)}

    void main(void) {
      vec2 glow = glowSample(vTextureCoord);
      float coverage = glow.x;
      float dist = glow.y;

      // The sprite, recolored for its tier. Textures are premultiplied, so unmultiply before recoloring.
      vec4 tex = texture2D(uSampler, vTextureCoord);
      vec3 rgb = tex.a > 0.0 ? tex.rgb / tex.a : vec3(0.0);
      rgb = mix(vec3(perceivedBrightness(rgb)), rgb, 1.0 + spriteSaturation);
      rgb = clamp(rgb * spriteTint * spriteBrightness, 0.0, 1.0);
      float a = tex.a * spriteAlpha;
      vec4 sprite = vec4(rgb * a, a);

      // The aura seeps into the silhouette's edges...
      float inner = min(1.0, (1.0 - coverage) * innerStrength * smoothstep(0.6, 1.0, tex.a)) * glowColor.a;
      float innerAlpha = tex.a * inner;
      sprite = sprite * (1.0 - inner) + vec4(glowColor.rgb * innerAlpha, innerAlpha);

      // ...and shines around it as a halo that fades out across its whole width...
      float outside = 1.0 - smoothstep(0.35, 1.0, tex.a);
      float room = 1.0 - sprite.a;
      float falloff = 1.0 - clamp((dist - 1.0) / DIST, 0.0, 1.0);
      float halo = pow(falloff, 1.3) * clamp(outerStrength * 0.3, 0.0, 0.9);

      // ...with steady rings at fixed distances, each set off by a dark band, that don't follow its pulse.
      float first = step(0.5, rings);
      float second = step(1.5, rings);
      float ringMask = max(first * lineAt(dist, 3.0, 0.6), second * lineAt(dist, 8.0, 0.6));
      float bandMask = max(first * lineAt(dist, 3.0, 1.8), second * lineAt(dist, 8.0, 1.8));
      float edgeMask = clamp(bandMask - ringMask, 0.0, 1.0);

      float haloAlpha = min(room, max(halo, edgeMask * 0.8) * outside * glowColor.a);
      float ringAlpha = min(room, ringMask * outside * max(glowColor.a, 0.75));
      vec3 haloColor = glowColor.rgb * (1.0 - 0.8 * edgeMask);

      vec4 color = vec4(haloColor * haloAlpha, haloAlpha);
      color = color * (1.0 - ringAlpha) + vec4(ringColor * ringAlpha, ringAlpha);
      gl_FragColor = (sprite + color) * alpha;
    }`;
    }
}
