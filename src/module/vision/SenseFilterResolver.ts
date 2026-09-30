import { AstralAuraFilter } from '@/module/vision/astralPerception/astralAuraFilter';
import {
    ASTRAL_PERCEPTION_VISION_MODE,
    ASTRAL_PROJECTION_VISION_MODE,
} from '@/module/vision/astralPerception/astralVisionModes';
import { getAstralTier } from '@/module/vision/astralPerception/astralSignature';
import { HeatSignatureFilter } from '@/module/vision/thermographicVision/heatSignatureFilter';
import UltrasoundDetectionMode, { ULTRASOUND_VISION_MODE } from '@/module/vision/ultrasoundVision/ultrasoundDetectionMode';
import AugmentedRealityFilter, { noiseBucket } from '@/module/vision/augmentedReality/arFilter';
import { getMatrixIconState } from '@/module/vision/augmentedReality/matrixIcon';
import { MatrixTraceFlow } from '@/module/vision/augmentedReality/MatrixTraceFlow';
import { EnvironmentalRegionFlow } from '@/module/vision/environmentalRegions/EnvironmentalRegionFlow';
import {
    getPhysicalTargetActor,
    hasPhysicalPresence,
    isAstralProjectionSource,
} from '@/module/vision/physicalVision/physicalDetectionMode';

type SenseFilter = PIXI.Filter | null | undefined;
type VisionSource = foundry.canvas.sources.PointVisionSource;

/**
 * Choose the filters a visible token renders with for the current viewers.
 *
 * Foundry caches one detection filter per detection mode class. Astral perception and thermographic vision
 * return a marker filter instead, which is swapped here for the filter of the token's own astral tier or heat
 * signature.
 *
 * On top of that primary look, senses that overlay the world add their own: the aura a perceiving viewer sees
 * over a token it also sees physically, and the Matrix icon of augmented reality. Each draws a different shape,
 * so they stay readable together.
 */
export class SenseFilterResolver {
    /** The primary filter of a visible token, from the detection filter Foundry picked for it. */
    static resolve(token: Token, detected: SenseFilter): SenseFilter {
        if (detected) {
            if (detected instanceof AstralAuraFilter) return AstralAuraFilter.forTarget(token) ?? detected;
            if (detected instanceof HeatSignatureFilter) return HeatSignatureFilter.forTarget(token) ?? detected;
            if (detected instanceof AugmentedRealityFilter && detected.locatesOnly) {
                return AugmentedRealityFilter.located(this.tracingNoise(token));
            }
            return detected;
        }
        return this.nonOpticalFilter(token);
    }

    /**
     * Collect the overlays of a visible token, in drawing order, into the given array.
     *
     * @param primary The token's primary filter, see resolve.
     */
    static collectOverlays(token: Token, primary: SenseFilter, overlays: PIXI.Filter[]) {
        overlays.length = 0;
        if (primary instanceof AugmentedRealityFilter && primary.locatesOnly) return overlays;
        if (!(primary instanceof AstralAuraFilter)) {
            const aura = this.perceivedAura(token);
            if (aura) overlays.push(aura);
        }
        const icon = this.augmentedRealityOverlay(token);
        if (icon) overlays.push(icon);
        return overlays;
    }

    /**
     * Astral projection and ultrasound vision disable scene lighting, so a token they don't detect through their
     * own detection mode, like the viewer's own token or a target found by basic sight, renders unlit and
     * disappears into the dark. Draw it the way that sense draws what it detects.
     */
    private static nonOpticalFilter(token: Token): SenseFilter {
        const mode = this.sharedNonOpticalMode();
        if (mode === ASTRAL_PROJECTION_VISION_MODE) return AstralAuraFilter.forTarget(token, 'shadow');
        if (mode === ULTRASOUND_VISION_MODE) return UltrasoundDetectionMode.getDetectionFilter();
        return null;
    }

    /**
     * The aura over a token that a perceiving viewer sees physically (SR5#312). Non-living things have none worth
     * adding, and astral boundaries still hide auras behind them.
     */
    private static perceivedAura(token: Token): SenseFilter {
        const tier = getAstralTier(token);
        if (!tier || tier === 'shadow') return null;

        const astral = CONFIG.Canvas.detectionModes.astralPerception;
        if (!astral) return null;
        let config: foundry.canvas.groups.CanvasVisibility.TestConfig | null = null;
        for (const source of canvas.effects!.visionSources) {
            if (!source.active || source.visionMode?.id !== ASTRAL_PERCEPTION_VISION_MODE) continue;
            const mode = (source.object as Token | null)?.document.detectionModes.astralPerception;
            if (!mode?.enabled) continue;
            config ??= this.visibilityTestConfig(token);
            if (astral.testVisibility(source, mode, config)) return AstralAuraFilter.forTarget(token, null, { overlay: true });
        }
        return null;
    }

    private static visibilityTestConfig(token: Token) {
        const visibility = canvas.visibility as unknown as {
            _createVisibilityTestConfig(
                points: ReturnType<TokenDocument['getVisibilityTestPoints']>,
                options: { tolerance: number; object: Token },
            ): foundry.canvas.groups.CanvasVisibility.TestConfig;
        };
        return visibility._createVisibilityTestConfig(token.document.getVisibilityTestPoints(), {
            tolerance: 0,
            object: token,
        });
    }

    /**
     * The icon of a token for the nearest viewer whose augmented reality spots it: an icon not running silent
     * within range, or one the viewer traced.
     */
    private static augmentedRealityOverlay(token: Token): SenseFilter {
        if (!hasPhysicalPresence(token)) return null;
        const actor = getPhysicalTargetActor(token);
        if (!actor) return null;
        const iconVisible = getMatrixIconState(actor) === 'visible';
        const distancePixels = canvas.dimensions!.distancePixels;

        let nearest = Infinity;
        let nearestViewer: Token | null = null;
        for (const [source, viewer, mode] of this.augmentedRealityViewers(token)) {
            if (viewer.actor && MatrixTraceFlow.isTraced(viewer.actor, actor)) {
                return AugmentedRealityFilter.forDistance(0, this.noiseAt(viewer));
            }
            if (!iconVisible) continue;
            const distance = Math.hypot(token.center.x - source.x, token.center.y - source.y) / distancePixels;
            const range = mode.range ?? Infinity;
            if (distance > range) continue;
            const fraction = range === Infinity ? 0 : distance / range;
            if (fraction < nearest) {
                nearest = fraction;
                nearestViewer = viewer;
            }
        }
        return nearestViewer ? AugmentedRealityFilter.forDistance(nearest, this.noiseAt(nearestViewer)) : null;
    }

    /** Noise around the viewers that traced a token, for its locator marker. */
    private static tracingNoise(token: Token) {
        const actor = getPhysicalTargetActor(token);
        if (!actor) return 0;
        let noise = 0;
        for (const [, viewer] of this.augmentedRealityViewers(token)) {
            if (viewer.actor && MatrixTraceFlow.isTraced(viewer.actor, actor)) noise = Math.max(noise, this.noiseAt(viewer));
        }
        return noise;
    }

    /** Active vision sources of other tokens with augmented reality enabled. */
    private static *augmentedRealityViewers(token: Token) {
        for (const source of canvas.effects!.visionSources as Iterable<VisionSource>) {
            if (!source.active || isAstralProjectionSource(source)) continue;
            const viewer = source.object as Token | null;
            if (!viewer || viewer === token || viewer.actor === token.actor) continue;
            const mode = viewer.document.detectionModes.augmentedReality;
            if (!mode?.enabled) continue;
            yield [source, viewer, mode] as const;
        }
    }

    /** Matrix noise bucket around a viewer, which garbles what its augmented reality shows (SR5#230). */
    private static noiseAt(viewer: Token) {
        return noiseBucket(EnvironmentalRegionFlow.ratingsAtToken(viewer.document).matrixNoise);
    }

    /** The non-optical vision mode every active vision source shares, if any. */
    static sharedNonOpticalMode(): string | null {
        let shared: string | null = null;
        for (const source of canvas.effects!.visionSources) {
            if (!source.active) continue;
            const mode = source.visionMode?.id ?? null;
            if (mode !== ASTRAL_PROJECTION_VISION_MODE && mode !== ULTRASOUND_VISION_MODE) return null;
            if (shared && shared !== mode) return null;
            shared = mode;
        }
        return shared;
    }
}
