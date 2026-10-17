import { type GlowPulse, PulsingGlowOverlayFilter } from '@/module/vision/filters/pulsingGlowFilter';
import {
    ASTRAL_TIERS,
    type AstralTier,
    getAstralSignature,
    MAX_ESSENCE_BUCKET,
} from './astralSignature';

type Color = [number, number, number];

interface BaseAuraLook {
    /** Aura color. */
    glow: Color;
    /** Halo width in pixels of a full aura. */
    distance: number;
    innerStrength: number;
    outerStrength: number;
    /** Added to the sprite's saturation; -1 is fully grey. */
    saturation: number;
    brightness: number;
    tint: Color;
    alpha: number;
    pulse: GlowPulse | null;
    /** Whether a lower Essence dims the aura. Astral forms have no Essence to lose. */
    followsEssence: boolean;
}

interface AuraLook extends BaseAuraLook {
    /** A brighter band hugging the silhouette, for beings active on the astral plane. */
    rim: number;
}

interface AccessibleAuraLook extends BaseAuraLook {
    /**
     * Bright rings around the silhouette, at fixed distances from it. Their count tells the tiers apart without
     * relying on color: none for a living aura, one for an Awakened aura, two for an astral form.
     */
    rings: 0 | 1 | 2;
}

export interface AuraOptions {
    /**
     * Draw only the aura around a token seen physically, leaving its sprite as it is: the astral plane overlaid on
     * the physical one while perceiving (SR5#312).
     */
    overlay?: boolean;
    /** Use the look of photosensitive mode. Defaults to whether the canvas is in photosensitive mode. */
    accessible?: boolean;
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
 * still. Awakened auras carry a rim, the look of beings active on the astral plane.
 */
export const AURA_LOOKS: Readonly<Record<AstralTier, AuraLook>> = {
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
 * The auras of photosensitive mode. Tiers also differ in ring count and brightness, so they read in any color vision
 * and in greyscale.
 *
 * Seen only astrally, a being's sprite takes on the color of its aura, so it doesn't pass for being seen
 * physically.
 */
export const ACCESSIBLE_AURA_LOOKS: Readonly<Record<AstralTier, AccessibleAuraLook>> = {
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

const essenceFactor = (look: BaseAuraLook, bucket: number) =>
    look.followsEssence ? Math.max(MIN_ESSENCE_FACTOR, bucket / MAX_ESSENCE_BUCKET) : 1;

/** How the sprite is drawn: recolored for its tier, or left out for an overlay on a token seen physically. */
const spriteUniforms = (look: BaseAuraLook, overlay: boolean) => overlay
    ? { spriteTint: WHITE, spriteSaturation: 0, spriteBrightness: 1, spriteAlpha: 0 }
    : { spriteTint: look.tint, spriteSaturation: look.saturation, spriteBrightness: look.brightness, spriteAlpha: look.alpha };

/**
 * How a token looks to astral sight: its sprite, recolored for its astral tier, inside an aura. As an overlay it
 * leaves the sprite alone and only adds the aura.
 *
 * Detection filters render the token alone with this filter, so it draws the sprite itself rather than
 * knocking it out like Foundry's glow.
 *
 * In photosensitive mode, Foundry's accessibility option, auras show as an AccessibleAstralAuraFilter.
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
            rimStrength: 0,
        };
    }

    /** The shared filter of a tier at an Essence bucket. */
    static forSignature(
        tier: AstralTier,
        bucket = MAX_ESSENCE_BUCKET,
        { overlay = false, accessible = !!canvas?.photosensitiveMode }: AuraOptions = {},
    ) {
        const effectiveBucket = AURA_LOOKS[tier].followsEssence
            ? Math.min(MAX_ESSENCE_BUCKET, Math.max(1, Math.round(bucket)))
            : MAX_ESSENCE_BUCKET;
        const signatureKey = ASTRAL_TIERS.indexOf(tier) * (MAX_ESSENCE_BUCKET + 1) + effectiveBucket;
        const key = signatureKey * 4 + Number(overlay) + 2 * Number(accessible);
        let filter = AstralAuraFilter.cache.get(key);
        if (!filter) {
            filter = accessible
                ? AccessibleAstralAuraFilter.createForSignature(tier, effectiveBucket, overlay)
                : AstralAuraFilter.createForSignature(tier, effectiveBucket, overlay);
            AstralAuraFilter.cache.set(key, filter);
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

    /** A new filter of a tier; forSignature shares them. */
    static createForSignature(tier: AstralTier, bucket: number, overlay: boolean): AstralAuraFilter {
        const look = AURA_LOOKS[tier];
        const essence = essenceFactor(look, bucket);
        const filter = this.create({
            distance: look.distance,
            quality: this.qualityForPerformance(),
            glowColor: [...look.glow, 0.5 + 0.5 * essence],
            ...spriteUniforms(look, overlay),
            rimStrength: look.rim * essence,
        }) as AstralAuraFilter;
        return filter.configure(tier, overlay, look, essence, look.distance);
    }

    protected configure(tier: AstralTier, overlay: boolean, look: BaseAuraLook, essence: number, distance: number) {
        this.tier = tier;
        this.overlay = overlay;
        return this.configureGlow({
            distance,
            innerStrength: look.innerStrength * essence,
            outerStrength: look.outerStrength * essence,
            pulse: look.pulse,
        });
    }

    /**
     * GLSL declaring the sprite uniforms and `vec4 auraSprite(vec4 tex, float coverage)`: the sprite, recolored for
     * its tier, with the aura seeping into the silhouette's edges. Needs GLOW_HEADER and PERCEIVED_BRIGHTNESS first.
     */
    static AURA_SPRITE = `
    uniform vec3 spriteTint;
    uniform float spriteSaturation;
    uniform float spriteBrightness;
    uniform float spriteAlpha;

    vec4 auraSprite(vec4 tex, float coverage) {
      // Textures are premultiplied, so unmultiply before recoloring.
      vec3 rgb = tex.a > 0.0 ? tex.rgb / tex.a : vec3(0.0);
      rgb = mix(vec3(perceivedBrightness(rgb)), rgb, 1.0 + spriteSaturation);
      rgb = clamp(rgb * spriteTint * spriteBrightness, 0.0, 1.0);
      float a = tex.a * spriteAlpha;
      vec4 sprite = vec4(rgb * a, a);

      float inner = min(1.0, (1.0 - coverage) * innerStrength * smoothstep(0.6, 1.0, tex.a)) * glowColor.a;
      float innerAlpha = tex.a * inner;
      return sprite * (1.0 - inner) + vec4(glowColor.rgb * innerAlpha, innerAlpha);
    }`;

    static override _createFragmentShader(quality: number, distance: number) {
        return `
    ${this.GLOW_HEADER}
    uniform float rimStrength;

    ${this.CONSTANTS}
    ${this.PERCEIVED_BRIGHTNESS}
    ${this.glowSample(quality, distance)}
    ${this.AURA_SPRITE}

    void main(void) {
      float coverage = glowSample(vTextureCoord).x;
      vec4 tex = texture2D(uSampler, vTextureCoord);
      vec4 sprite = auraSprite(tex, coverage);

      // The aura shines around the sprite, with a brighter band close to the silhouette for astrally active beings.
      float outside = 1.0 - smoothstep(0.35, 1.0, tex.a);
      float rim = rimStrength * smoothstep(0.25, 0.45, coverage);
      float glowAlpha = min(1.0 - sprite.a, clamp((coverage * outerStrength + rim) * outside, 0.0, 1.0));
      glowAlpha *= glowColor.a;

      gl_FragColor = (sprite + vec4(glowColor.rgb * glowAlpha, glowAlpha)) * alpha;
    }`;
    }
}

/**
 * The aura of photosensitive mode: a halo that fades out across its width, with the tier's rings, and an aura that
 * narrows as well as dims with Essence loss.
 */
export class AccessibleAstralAuraFilter extends AstralAuraFilter {
    static override get defaultUniforms() {
        return {
            ...super.defaultUniforms,
            rings: 0,
            ringColor: WHITE,
        };
    }

    static override createForSignature(tier: AstralTier, bucket: number, overlay: boolean) {
        const look = ACCESSIBLE_AURA_LOOKS[tier];
        const essence = essenceFactor(look, bucket);
        // Cyberware narrows the halo as well as dimming it, so Essence doesn't rest on brightness alone.
        const distance = look.outerStrength
            ? Math.max(MIN_HALO_DISTANCE, Math.round(look.distance * (0.5 + 0.5 * essence)))
            : look.distance;
        const filter = this.create({
            distance,
            quality: this.qualityForPerformance(),
            glowColor: [...look.glow, 0.5 + 0.5 * essence],
            ...spriteUniforms(look, overlay),
            rings: look.rings,
            ringColor: look.glow.map(channel => channel + (1 - channel) * RING_WHITENESS),
        }) as AccessibleAstralAuraFilter;
        return filter.configure(tier, overlay, look, essence, distance);
    }

    static override _createFragmentShader(quality: number, distance: number) {
        return `
    ${this.GLOW_HEADER}
    uniform float rings;
    uniform vec3 ringColor;

    ${this.CONSTANTS}
    ${this.PERCEIVED_BRIGHTNESS}
    ${this.glowSample(quality, distance)}
    ${this.AURA_SPRITE}

    void main(void) {
      vec2 glow = glowSample(vTextureCoord);
      float coverage = glow.x;
      float dist = glow.y;
      vec4 tex = texture2D(uSampler, vTextureCoord);
      vec4 sprite = auraSprite(tex, coverage);

      // The aura shines around the sprite as a halo that fades out across its whole width...
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
