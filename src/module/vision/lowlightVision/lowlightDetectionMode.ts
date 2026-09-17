
//todo: v10 foundry-vtt-types 

import LowLightVisionFilter from "./lowlightFilter";
import { PhysicalSightDetectionMode } from '@/module/vision/physicalVision/physicalDetectionMode';

export default class LowlightVisionDetectionMode extends PhysicalSightDetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= LowLightVisionFilter.create();
    }

    // PhysicalSightDetectionMode supplies the optical and astral-source restrictions.
}
