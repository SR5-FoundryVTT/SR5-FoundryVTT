import {
    getPhysicalTargetActor,
    hasPhysicalPresence,
    isAstralProjectionSource,
    isInvisiblePhysicalTarget,
} from '@/module/vision/physicalVision/physicalDetectionMode';
import { HeatSignatureFilter } from './heatSignatureFilter';

export default class ThermographicVisionDetectionMode extends foundry.canvas.perception.DetectionMode {
    /**
     * Marks a token as detected by thermographic vision. SR5Token swaps it for the filter of the token's own
     * signature, see SenseFilterResolver.
     */
    static override getDetectionFilter() {
        return HeatSignatureFilter.forSignature('warm');
    }

    override _canDetect(...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>) {
        if (isAstralProjectionSource(visionSource) || !hasPhysicalPresence(target)) return false;
        if (isInvisiblePhysicalTarget(target)) return false;
        const signature = getPhysicalTargetActor(target)?.system.visibilityChecks.targets.physical.thermographic;
        return !!signature && signature !== 'none';
    }
}
