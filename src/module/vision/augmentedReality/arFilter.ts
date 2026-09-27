import { type GlowPulse, PulsingGlowOverlayFilter } from '@/module/vision/filters/pulsingGlowFilter';

type Color = [number, number, number, number];

const AR_COLOR: Color = [0.35, 1.0, 0.6, 1.0];

/** Distance steps of the icon overlay; farther icons are dimmer (SR5#217). */
const DISTANCE_STEPS = 4;

/** How dim an icon at the edge of augmented reality range gets. */
const MIN_DISTANCE_FACTOR = 0.35;

const LOCATOR_PULSE: GlowPulse = { min: 0.6, max: 1.4, period: 1500 };

/**
 * The outline augmented reality draws around a device icon's owner.
 *
 * Foundry's glow knocks out the sprite, so over a token the viewer sees, it only adds the icon's outline; alone,
 * it marks where a traced icon is without showing its owner.
 */
export default class AugmentedRealityFilter extends PulsingGlowOverlayFilter {
    private static readonly overlays: AugmentedRealityFilter[] = [];
    private static locator: AugmentedRealityFilter | null = null;

    /** Whether this filter stands alone for a token only found through a trace. */
    locatesOnly = false;

    /**
     * The overlay of an icon on a token the viewer sees.
     *
     * @param fraction Distance to the icon as a fraction of augmented reality range, from 0 to 1.
     */
    static forDistance(fraction: number) {
        const step = Math.min(DISTANCE_STEPS - 1, Math.max(0, Math.floor(fraction * DISTANCE_STEPS)));
        return this.overlays[step] ??= this.createOverlay(step);
    }

    /** The marker of a traced icon, showing where it is. */
    static located() {
        if (this.locator) return this.locator;
        const filter = this.create({ glowColor: AR_COLOR, distance: 10 }) as AugmentedRealityFilter;
        filter.fitPadding(10);
        filter.innerStrength = 2;
        filter.outerStrength = 4;
        filter.pulse = LOCATOR_PULSE;
        filter.animated = true;
        filter.locatesOnly = true;
        return this.locator = filter;
    }

    private static createOverlay(step: number) {
        const factor = 1 - (1 - MIN_DISTANCE_FACTOR) * (step / (DISTANCE_STEPS - 1));
        const filter = this.create({ glowColor: AR_COLOR, distance: 8 }) as AugmentedRealityFilter;
        filter.fitPadding(8);
        filter.innerStrength = 2 * factor;
        filter.outerStrength = 4 * factor;
        filter.animated = false;
        return filter;
    }
}
