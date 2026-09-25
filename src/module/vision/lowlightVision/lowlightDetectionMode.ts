
//todo: v10 foundry-vtt-types 

import LowLightVisionFilter from "./lowlightFilter";
import { PhysicalSightDetectionMode } from '@/module/vision/physicalVision/physicalDetectionMode';

export default class LowlightVisionDetectionMode extends PhysicalSightDetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= LowLightVisionFilter.create();
    }

    // PhysicalSightDetectionMode supplies the optical and astral-source restrictions.

    /**
     * Low-light vision sees in any light short of total darkness: inside a light source, or where the
     * scene or a region is not fully dark.
     */
    override _testPoint(...args: Parameters<PhysicalSightDetectionMode['_testPoint']>) {
        if (!super._testPoint(...args)) return false;
        const { point } = args[3];
        return canvas.effects.testInsideLight(point) || canvas.effects.getDarknessLevel(point) < 1;
    }
}
