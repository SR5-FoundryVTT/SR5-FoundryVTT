import { hasPhysicalPresence, isAstralVisionSource } from '../physicalVision/physicalDetectionMode';

export const shouldSuppressPhysicalLightVision = (
    target: object | null | undefined,
    visionSources: Iterable<foundry.canvas.sources.PointVisionSource>,
) => {
    if (target instanceof Token && !hasPhysicalPresence(target)) return true;
    const activeSources = Array.from(visionSources).filter(source => source.active);
    return activeSources.length > 0 && activeSources.every(source => isAstralVisionSource(source));
};

export class AstralAwareCanvasVisibility extends foundry.canvas.groups.CanvasVisibility {
    override testVisibility(
        ...args: Parameters<foundry.canvas.groups.CanvasVisibility['testVisibility']>
    ) {
        const [, options] = args;
        if (!shouldSuppressPhysicalLightVision(options?.object, canvas.effects.visionSources)) {
            return super.testVisibility(...args);
        }

        const visionLights = Array.from(canvas.effects.lightSources)
            .filter(source => source.active && source.data.vision);
        for (const source of visionLights) source.data.vision = false;
        try {
            return super.testVisibility(...args);
        } finally {
            for (const source of visionLights) source.data.vision = true;
        }
    }
}
