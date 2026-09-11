
//todo: v10 foundry-vtt-types 

import LowLightVisionFilter from "./lowlightFilter";
import { PhysicalSightDetectionMode } from '@/module/vision/physicalVision/physicalDetectionMode';

export default class LowlightVisionDetectionMode extends PhysicalSightDetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= LowLightVisionFilter.create();
    }

    override _canDetect(
        ...args: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        const [visionSource] = args;
        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

        return !isAstralPerceiving && super._canDetect(...args);
    }
}
