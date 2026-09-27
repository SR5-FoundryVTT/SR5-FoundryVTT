import AugmentedRealityFilter from './arFilter';
import { MatrixTraceFlow } from './MatrixTraceFlow';
import {
    getPhysicalTargetActor,
    hasPhysicalPresence,
    isAstralVisionSource,
} from '@/module/vision/physicalVision/physicalDetectionMode';

/** SR5#235 icons within 100 m of a user are spotted automatically. */
export const AUGMENTED_REALITY_RANGE_METERS = 100;

/**
 * Augmented reality overlays the Matrix on what its user sees (SR5#229).
 *
 * Spotting an icon doesn't tell where its device is; only a successful Trace Icon does (SR5#243). So this mode
 * only detects traced icons, wherever they are and whatever hides their owner from sight. Icons of tokens the
 * viewer already sees are outlined by the SenseFilterResolver, within this mode's range.
 *
 * Astral forms share their body's icon and a manifesting being can't be recorded by technology (SR5#314), so
 * neither shows up.
 */
export default class AugmentedRealityVisionDetectionMode extends foundry.canvas.perception.DetectionMode {

    static override getDetectionFilter() {
        return AugmentedRealityFilter.located();
    }

    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        if (isAstralVisionSource(visionSource) || !hasPhysicalPresence(target)) return false;
        const viewer = (visionSource?.object as foundry.canvas.placeables.Token | null | undefined)?.actor;
        const actor = getPhysicalTargetActor(target);
        if (!viewer || !actor || viewer === actor) return false;
        return MatrixTraceFlow.isTraced(viewer, actor);
    }

    /** A trace lasts as long as a mark does, at any distance. */
    override _testRange(): boolean {
        return true;
    }
}
