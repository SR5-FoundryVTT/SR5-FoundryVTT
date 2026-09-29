export interface GlowPulse {
    min: number;
    max: number;
    /** Milliseconds per cycle. */
    period: number;
}

/** The current factor of a pulse, 1 when not animated or in photosensitive mode. */
export const pulseFactor = (pulse: GlowPulse | null, animated = true) => {
    if (!animated || !pulse || canvas.photosensitiveMode) return 1;
    return Math.oscillation(pulse.min, pulse.max, canvas.app!.ticker.lastTime, pulse.period);
};

/**
 * Foundry's glow outline with a configurable pulse instead of its fixed 0.5-2x oscillation.
 *
 * The pulse stops in photosensitive mode, leaving a steady glow.
 */
export class PulsingGlowOverlayFilter extends foundry.canvas.rendering.filters.GlowOverlayFilter {
    pulse: GlowPulse | null = null;

    /**
     * Glow sampling quality for the canvas performance mode, like Foundry's outline filter uses: fewer samples
     * around the silhouette on slower machines. The performance mode only changes on reload.
     */
    static qualityForPerformance() {
        const { LOW, MED } = CONST.CANVAS_PERFORMANCE_MODES;
        switch (canvas.performance?.mode) {
            case LOW: return 0.05;
            case MED: return 0.075;
            default: return 0.1;
        }
    }

    /**
     * GLSL declaring `vec2 glowSample(vec2 uv)`, the sampling loop of Foundry's GlowOverlayFilter, itself based on
     * https://github.com/pixijs/filters/tree/main/filters/glow (MIT). Needs `uSampler`, `inputSize`, `inputClamp`
     * and `PI` to be declared first. It returns:
     *
     * - x: how much of the silhouette surrounds the point, from 0 far away to 1 deep inside.
     * - y: roughly how many pixels away the silhouette is, up to `DIST + 1` when out of reach. Rings drawn at a
     *   fixed distance from it keep their spacing whatever the halo width.
     */
    static glowSample(quality: number, distance: number) {
        return `
    const float DIST = ${distance.toFixed(0)}.0;
    const float ANGLE_STEP_SIZE = min(${(1 / quality / distance).toFixed(7)}, PI * 2.0);
    const float ANGLE_STEP_NUM = ceil(PI * 2.0 / ANGLE_STEP_SIZE);
    const float MAX_TOTAL_ALPHA = ANGLE_STEP_NUM * DIST * (DIST + 1.0) / 2.0;

    float getClip(in vec2 uv) {
      return step(3.5,
       step(inputClamp.x, uv.x) +
       step(inputClamp.y, uv.y) +
       step(uv.x, inputClamp.z) +
       step(uv.y, inputClamp.w));
    }

    vec2 glowSample(in vec2 uv) {
      vec2 px = inputSize.zw;
      float totalAlpha = 0.0;
      float nearest = DIST + 1.0;
      for (float angle = 0.0; angle < PI * 2.0; angle += ANGLE_STEP_SIZE) {
        vec2 direction = vec2(cos(angle), sin(angle)) * px;
        for (float curDistance = 0.0; curDistance < DIST; curDistance++) {
          vec2 displaced = uv + direction * (curDistance + 1.0);
          vec4 sampled = texture2D(uSampler, displaced) * getClip(displaced);
          totalAlpha += (DIST - curDistance) * smoothstep(0.5, 1.0, sampled.a);
          if (sampled.a > 0.5) nearest = min(nearest, curDistance + 1.0);
        }
      }
      return vec2(totalAlpha / MAX_TOTAL_ALPHA, nearest);
    }

    /** A line of the given half width at a distance from the silhouette, with soft edges. */
    float lineAt(float distance, float center, float halfWidth) {
      return 1.0 - smoothstep(halfWidth, halfWidth + 1.0, abs(distance - center));
    }`;
    }

    /** Give the filter room for its halo. Foundry keeps a 6 px padding, which would clip a wider one. */
    protected fitPadding(distance: number) {
        this.padding = Math.max(this.padding, distance);
    }

    override apply(
        ...[filterManager, input, output, clear]: Parameters<foundry.canvas.rendering.filters.GlowOverlayFilter['apply']>
    ) {
        const strength = canvas.stage!.worldTransform.d * pulseFactor(this.pulse, this.animated);
        this.uniforms.outerStrength = this.outerStrength * strength;
        this.uniforms.innerStrength = this.innerStrength * strength;
        filterManager.applyFilter(this, input, output, clear);
    }
}
