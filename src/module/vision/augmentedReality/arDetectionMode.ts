import AugmentedRealityVisionFilter from "./arFilter";
import { hasPhysicalPresence, isAstralVisionSource } from '@/module/vision/physicalVision/physicalDetectionMode';

export default class AugmentedRealityVisionDetectionMode extends foundry.canvas.perception.DetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= AugmentedRealityVisionFilter.create();
    }

    /**
     * AR shows the icons of devices physically present. An astral form shares its body's actor and icon, and
     * a manifesting being can't be recorded by technology (SR5#314), so neither shows up.
     */
    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        if (isAstralVisionSource(visionSource) || !hasPhysicalPresence(target)) return false;
        const matrix = (target?.document as TokenDocument | undefined)?.actor?.system.visibilityChecks.targets.matrix;
        return !!matrix?.hasIcon && !matrix.runningSilent;
    }
}
