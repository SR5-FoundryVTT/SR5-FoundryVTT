import ThermographicVisionFilter from './thermographicFilter';

export default class ThermographicVisionDetectionMode extends foundry.canvas.perception.DetectionMode {
    static override getDetectionFilter() {
        return (this._detectionFilter ??= ThermographicVisionFilter.create());
    }
  
    override _canDetect(visionSource, target) {
        const tgt = target?.document;
        const targetHasHeat =
            tgt instanceof TokenDocument && tgt.actor !== null
            && tgt.actor?.system.visibilityChecks.meat.hasHeat;

        const targetIsVisible =
            tgt instanceof TokenDocument
            && !tgt.actor?.statuses.has(CONFIG.specialStatusEffects.INVISIBLE);

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

        return targetHasHeat && targetIsVisible && !isAstralPerceiving;
    }
}
  