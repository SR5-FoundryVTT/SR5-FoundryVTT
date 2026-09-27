export interface GlowPulse {
    min: number;
    max: number;
    /** Milliseconds per cycle. */
    period: number;
}

/**
 * Foundry's glow outline with a configurable pulse instead of its fixed 0.5-2x oscillation.
 *
 * The pulse stops in photosensitive mode, leaving a steady glow.
 */
export class PulsingGlowOverlayFilter extends foundry.canvas.rendering.filters.GlowOverlayFilter {
    pulse: GlowPulse | null = null;

    /** Give the filter room for its halo. Foundry keeps a 6 px padding, which would clip a wider one. */
    protected fitPadding(distance: number) {
        this.padding = Math.max(this.padding, distance);
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
