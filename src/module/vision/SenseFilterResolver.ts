import { AstralAuraFilter } from '@/module/vision/astralPerception/astralAuraFilter';
import { ASTRAL_PERCEPTION_VISION_MODE } from '@/module/vision/astralPerception/AstralPerceptionFlow';
import { HeatSignatureFilter } from '@/module/vision/thermographicVision/heatSignatureFilter';
import UltrasoundDetectionMode, { ULTRASOUND_VISION_MODE } from '@/module/vision/ultrasoundVision/ultrasoundDetectionMode';

type SenseFilter = PIXI.Filter | null | undefined;

/**
 * Choose the filter a visible token renders with for the current viewers.
 *
 * Foundry caches one detection filter per detection mode class. Astral perception and thermographic vision
 * return a marker filter instead, which is swapped here for the filter of the token's own astral tier or heat
 * signature.
 */
export class SenseFilterResolver {
    static resolve(token: Token, detected: SenseFilter): SenseFilter {
        if (detected) {
            if (detected instanceof AstralAuraFilter) return AstralAuraFilter.forTarget(token) ?? detected;
            if (detected instanceof HeatSignatureFilter) return HeatSignatureFilter.forTarget(token) ?? detected;
            return detected;
        }
        return this.nonOpticalFilter(token);
    }

    /**
     * Astral perception and ultrasound vision disable scene lighting, so a token they don't detect through their
     * own detection mode, like the viewer's own token or a target found by basic sight, renders unlit and
     * disappears into the dark. Draw it the way that sense draws what it detects.
     */
    private static nonOpticalFilter(token: Token): SenseFilter {
        const mode = this.sharedNonOpticalMode();
        if (mode === ASTRAL_PERCEPTION_VISION_MODE) return AstralAuraFilter.forTarget(token, 'shadow');
        if (mode === ULTRASOUND_VISION_MODE) return UltrasoundDetectionMode.getDetectionFilter();
        return null;
    }

    /** The non-optical vision mode every active vision source shares, if any. */
    static sharedNonOpticalMode(): string | null {
        let shared: string | null = null;
        for (const source of canvas.effects!.visionSources) {
            if (!source.active) continue;
            const mode = source.visionMode?.id ?? null;
            if (mode !== ASTRAL_PERCEPTION_VISION_MODE && mode !== ULTRASOUND_VISION_MODE) return null;
            if (shared && shared !== mode) return null;
            shared = mode;
        }
        return shared;
    }
}
