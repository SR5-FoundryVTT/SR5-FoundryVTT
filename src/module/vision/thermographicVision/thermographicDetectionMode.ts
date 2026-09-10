import ThermographicVisionFilter from './thermographicFilter';
import type { ThermographicSignature } from '@/module/types/template/Visibility';

export default class ThermographicVisionDetectionMode extends foundry.canvas.perception.DetectionMode {
    private static activeSignature: Exclude<ThermographicSignature, 'none'> = 'warm';
    private static readonly filters = new Map<Exclude<ThermographicSignature, 'none'>, ThermographicVisionFilter>();

    static override getDetectionFilter() {
        let filter = this.filters.get(this.activeSignature);
        if (!filter) {
            filter = ThermographicVisionFilter.create({ heatLevel: this.heatLevel(this.activeSignature) });
            this.filters.set(this.activeSignature, filter);
        }
        return filter;
    }
  
    override _canDetect(
        ...[visionSource, target]: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>
    ) {
        const tgt = target?.document instanceof TokenDocument ? target.document : null;
        const signature = tgt?.actor?.system.visibilityChecks.targets.physical.thermographic as ThermographicSignature | undefined;
        if (!signature || signature === 'none') return false;
        ThermographicVisionDetectionMode.activeSignature = signature;

        const targetIsVisible = !tgt?.actor?.statuses.has(CONFIG.specialStatusEffects.INVISIBLE);

        const isAstralPerceiving = visionSource?.visionMode?.id === "astralPerception";

        return targetIsVisible && !isAstralPerceiving;
    }

    private static heatLevel(signature: Exclude<ThermographicSignature, 'none'>) {
        return { cold: 1, warm: 2, hot: 3 }[signature];
    }
}
