import { AstralAuraFilter } from '@/module/vision/astralPerception/astralAuraFilter';
import { ASTRAL_PERCEPTION_VISION_MODE } from '@/module/vision/astralPerception/AstralPerceptionFlow';
import { HeatSignatureFilter } from '@/module/vision/thermographicVision/heatSignatureFilter';
import UltrasoundDetectionMode, { ULTRASOUND_VISION_MODE } from '@/module/vision/ultrasoundVision/ultrasoundDetectionMode';
import AugmentedRealityFilter from '@/module/vision/augmentedReality/arFilter';
import { getMatrixIconState } from '@/module/vision/augmentedReality/matrixIcon';
import { MatrixTraceFlow } from '@/module/vision/augmentedReality/MatrixTraceFlow';
import {
    getPhysicalTargetActor,
    hasPhysicalPresence,
    isAstralVisionSource,
} from '@/module/vision/physicalVision/physicalDetectionMode';

type SenseFilter = PIXI.Filter | null | undefined;

/**
 * Choose the filter a visible token renders with for the current viewers.
 *
 * Foundry caches one detection filter per detection mode class. Astral perception and thermographic vision
 * return a marker filter instead, which is swapped here for the filter of the token's own astral tier or heat
 * signature.
 *
 * Tokens seen without a detection filter of their own get the outline of their Matrix icon for viewers using
 * augmented reality.
 */
export class SenseFilterResolver {
    static resolve(token: Token, detected: SenseFilter): SenseFilter {
        if (detected) {
            if (detected instanceof AstralAuraFilter) return AstralAuraFilter.forTarget(token) ?? detected;
            if (detected instanceof HeatSignatureFilter) return HeatSignatureFilter.forTarget(token) ?? detected;
            return detected;
        }
        return this.nonOpticalFilter(token) ?? this.augmentedRealityOverlay(token);
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

    /**
     * The icon outline of a token for the nearest viewer whose augmented reality spots it: an icon not running
     * silent within range, or one the viewer traced.
     */
    private static augmentedRealityOverlay(token: Token): SenseFilter {
        if (!hasPhysicalPresence(token)) return null;
        const actor = getPhysicalTargetActor(token);
        if (!actor) return null;
        const iconVisible = getMatrixIconState(actor) === 'visible';
        const distancePixels = canvas.dimensions!.distancePixels;

        let nearest = Infinity;
        for (const source of canvas.effects!.visionSources) {
            if (!source.active || isAstralVisionSource(source)) continue;
            const viewer = source.object as Token | null;
            if (!viewer || viewer === token || viewer.actor === actor) continue;
            const mode = viewer.document.detectionModes.augmentedReality;
            if (!mode?.enabled) continue;
            if (viewer.actor && MatrixTraceFlow.isTraced(viewer.actor, actor)) return AugmentedRealityFilter.forDistance(0);
            if (!iconVisible) continue;
            const distance = Math.hypot(token.center.x - viewer.center.x, token.center.y - viewer.center.y) / distancePixels;
            const range = mode.range ?? Infinity;
            if (distance <= range) nearest = Math.min(nearest, range === Infinity ? 0 : distance / range);
        }
        return nearest === Infinity ? null : AugmentedRealityFilter.forDistance(nearest);
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
