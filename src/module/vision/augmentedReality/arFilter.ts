import { type GlowPulse, pulseFactor } from '@/module/vision/filters/pulsingGlowFilter';

type Color = [number, number, number];

const AR_COLOR: Color = [0.35, 1.0, 0.6];

/** Distance steps of the icon overlay; farther icons are dimmer (SR5#217). */
const DISTANCE_STEPS = 4;

/** How dim an icon at the edge of augmented reality range gets. */
const MIN_DISTANCE_FACTOR = 0.35;

/** Matrix noise buckets: none, 1-3, 4-6 and 7 or more. */
export const NOISE_BUCKETS = 4;

/** Share of scanlines and bracket rows each noise bucket drops. */
const NOISE_DROPOUT = [0, 0.15, 0.3, 0.45];

/** Steps per second of the noise pattern. */
const NOISE_RATE = 4;

const LOCATOR_PULSE: GlowPulse = { min: 0.55, max: 1, period: 1500 };

/** Room around the token for its brackets, in screen pixels. */
const PADDING = 10;

/** How far outside the token the brackets sit, in screen pixels. */
const BRACKET_GAP = 4;

/** The Matrix noise bucket of a noise rating. */
export const noiseBucket = (noise: number) => {
    if (!(noise > 0)) return 0;
    return Math.min(NOISE_BUCKETS - 1, Math.ceil(noise / 3));
};

/**
 * The Matrix look of augmented reality: crisp corner brackets around a device icon's owner, like a heads-up display
 * target box, with a scanline hatch and a pixel outline on the silhouette. It only adds to the token, so it stacks
 * on top of whatever other sense shows it.
 *
 * Brackets and scanlines are shapes no other sense uses, so AR reads without relying on its color. Each bracket
 * has a dark edge, keeping it visible on bright maps. Matrix noise around the viewer drops scanlines and bracket
 * rows; in photosensitive mode that pattern holds still.
 */
export default class AugmentedRealityFilter extends foundry.canvas.rendering.filters.AbstractBaseFilter {
    private static readonly overlays = new Map<number, AugmentedRealityFilter>();
    private static readonly locators = new Map<number, AugmentedRealityFilter>();

    /** Whether this filter stands alone for a token only found through a trace. */
    locatesOnly = false;
    pulse: GlowPulse | null = null;
    animated = false;

    /**
     * The overlay of an icon on a token the viewer sees.
     *
     * @param fraction Distance to the icon as a fraction of augmented reality range, from 0 to 1.
     * @param noise Matrix noise bucket around the viewer, see noiseBucket.
     */
    static forDistance(fraction: number, noise = 0) {
        const step = Math.min(DISTANCE_STEPS - 1, Math.max(0, Math.floor(fraction * DISTANCE_STEPS)));
        const bucket = this.clampNoise(noise);
        const key = step * NOISE_BUCKETS + bucket;
        let filter = this.overlays.get(key);
        if (!filter) {
            filter = this.createOverlay(step, bucket);
            this.overlays.set(key, filter);
        }
        return filter;
    }

    /**
     * The marker of a traced icon, showing where it is: brackets around a crosshair, without the silhouette of
     * whatever carries it.
     */
    static located(noise = 0) {
        const bucket = this.clampNoise(noise);
        let filter = this.locators.get(bucket);
        if (!filter) {
            filter = this.createFilter({ intensity: 1, silhouette: 0, crosshair: 1, dropout: NOISE_DROPOUT[bucket] });
            filter.pulse = LOCATOR_PULSE;
            filter.animated = true;
            filter.locatesOnly = true;
            this.locators.set(bucket, filter);
        }
        return filter;
    }

    private static createOverlay(step: number, noise: number) {
        const intensity = 1 - (1 - MIN_DISTANCE_FACTOR) * (step / (DISTANCE_STEPS - 1));
        const filter = this.createFilter({ intensity, silhouette: 1, crosshair: 0, dropout: NOISE_DROPOUT[noise] });
        filter.animated = noise > 0;
        return filter;
    }

    private static createFilter(uniforms: Record<string, number>) {
        const filter = this.create({ ...uniforms }) as AugmentedRealityFilter;
        filter.padding = PADDING;
        // Keep the whole padded frame, so the brackets stay in place at the edge of the screen.
        filter.autoFit = false;
        return filter;
    }

    private static clampNoise(noise: number) {
        return Math.min(NOISE_BUCKETS - 1, Math.max(0, Math.round(noise)));
    }

    static override get defaultUniforms() {
        return {
            arColor: AR_COLOR,
            intensity: 1,
            pulse: 1,
            silhouette: 1,
            crosshair: 0,
            dropout: 0,
            time: 0,
            pad: PADDING,
            gap: BRACKET_GAP,
            thickness: 2,
        };
    }

    static override _createFragmentShader() {
        return `
    precision ${PIXI.Program.defaultFragmentPrecision} float;
    varying vec2 vTextureCoord;

    uniform sampler2D uSampler;
    uniform vec4 inputSize;
    uniform vec4 outputFrame;
    uniform vec3 arColor;
    uniform float intensity;
    uniform float pulse;
    uniform float silhouette;
    uniform float crosshair;
    uniform float dropout;
    uniform float time;
    uniform float pad;
    uniform float gap;
    uniform float thickness;

    ${this.PRNG}

    /** An L-shaped bracket arm: within the given width of a box side and the given length of a corner. */
    float bracket(vec2 inset, float width, float arm) {
      float vertical = step(0.0, inset.x) * step(inset.x, width) * step(0.0, inset.y) * step(inset.y, arm);
      float horizontal = step(0.0, inset.y) * step(inset.y, width) * step(0.0, inset.x) * step(inset.x, arm);
      return max(vertical, horizontal);
    }

    float silhouetteAt(vec2 offset) {
      return step(0.5, texture2D(uSampler, vTextureCoord + offset * inputSize.zw).a);
    }

    void main(void) {
      // Pixel position in the padded frame; the token itself sits inside the padding.
      vec2 p = vTextureCoord * inputSize.xy;
      vec2 lo = vec2(pad - gap);
      vec2 hi = outputFrame.zw - lo;
      vec2 inset = min(p - lo, hi - p);
      float arm = 0.25 * min(hi.x - lo.x, hi.y - lo.y);

      // Brackets at the corners, and a crosshair at the center of a located icon.
      float mark = bracket(inset, thickness, arm);
      float edge = bracket(inset + 1.0, thickness + 2.0, arm + 2.0);
      vec2 fromCenter = abs(p - (lo + hi) * 0.5);
      float cross = crosshair * max(
        step(fromCenter.x, thickness * 0.5) * step(arm * 0.2, fromCenter.y) * step(fromCenter.y, arm * 0.7),
        step(fromCenter.y, thickness * 0.5) * step(arm * 0.2, fromCenter.x) * step(fromCenter.x, arm * 0.7));
      float crossEdge = crosshair * max(
        step(fromCenter.x, thickness * 0.5 + 1.0) * step(arm * 0.2 - 1.0, fromCenter.y) * step(fromCenter.y, arm * 0.7 + 1.0),
        step(fromCenter.y, thickness * 0.5 + 1.0) * step(arm * 0.2 - 1.0, fromCenter.x) * step(fromCenter.x, arm * 0.7 + 1.0));
      mark = max(mark, cross);
      edge = max(edge, crossEdge);

      // The silhouette: a faint scanline hatch inside and a one pixel outline around it.
      float inside = silhouetteAt(vec2(0.0));
      float around = max(max(silhouetteAt(vec2(1.0, 0.0)), silhouetteAt(vec2(-1.0, 0.0))),
                         max(silhouetteAt(vec2(0.0, 1.0)), silhouetteAt(vec2(0.0, -1.0))));
      float outline = silhouette * around * (1.0 - inside);
      float scanline = silhouette * inside * step(mod(floor(p.y), 3.0), 0.5) * 0.3;

      // Matrix noise drops whole rows; time is held at zero in photosensitive mode.
      float row = floor(p.y / 2.0);
      float kept = step(dropout, random(vec2(row, floor(time * ${NOISE_RATE.toFixed(1)}))));

      float strength = intensity * pulse * kept;
      float markAlpha = mark * strength;
      float lineAlpha = max(outline * 0.9, scanline) * strength;
      float darkAlpha = edge * (1.0 - mark) * 0.7 * strength;

      vec4 color = vec4(arColor * markAlpha, markAlpha);
      color += vec4(arColor * lineAlpha, lineAlpha) * (1.0 - color.a);
      color += vec4(vec3(0.0), darkAlpha) * (1.0 - color.a);
      gl_FragColor = color;
    }`;
    }

    override apply(
        ...[filterManager, input, output, clear]: Parameters<PIXI.Filter['apply']>
    ) {
        const zoom = canvas.stage!.worldTransform.d;
        this.uniforms.thickness = Math.max(1.5, 2 * Math.min(zoom, 1.5));
        this.uniforms.pulse = this.pulse ? pulseFactor(this.pulse, this.animated) : 1;
        this.uniforms.time = this.animated && !canvas.photosensitiveMode ? canvas.app!.ticker.lastTime / 1000 : 0;
        filterManager.applyFilter(this, input, output, clear);
    }
}
