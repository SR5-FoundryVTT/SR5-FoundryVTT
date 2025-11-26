import ThermographicVisionFilter from './thermographicFilter';

export default class ThermographicVisionDetectionMode extends foundry.canvas.perception.DetectionMode {
    static override getDetectionFilter() {
        return (this._detectionFilter ??= ThermographicVisionFilter.create());
    }
  
    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        const targetHasHeat = !!tgt?.actor?.system.visibilityChecks.meat.hasHeat;

        const targetIsVisible = !tgt?.actor?.statuses.has(CONFIG.specialStatusEffects.INVISIBLE);

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

        return targetHasHeat && targetIsVisible && !isAstralPerceiving;
    }
}
  