
//todo: v10 foundry-vtt-types 

import LowLightVisionFilter from "./lowlightFilter";

export default class LowlightVisionDetectionMode extends DetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= LowLightVisionFilter.create();
    }

    override _canDetect(visionSource, target) {
        const tgt = target?.document;
        const targetIsVisible =
            tgt instanceof TokenDocument
            && !tgt.actor?.statuses.has(CONFIG.specialStatusEffects.INVISIBLE);

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

        return targetIsVisible && !isAstralPerceiving
    }
}
  