
//todo: v10 foundry-vtt-types 

import LowLightVisionFilter from "./lowlightFilter";

export default class LowlightVisionDetectionMode extends foundry.canvas.perception.DetectionMode {

    static override getDetectionFilter() {
        return this._detectionFilter ??= LowLightVisionFilter.create();
    }

    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        const targetIsVisible = !tgt?.actor?.statuses.has(CONFIG.specialStatusEffects.INVISIBLE);

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

        return targetIsVisible && !isAstralPerceiving;
    }
}
  