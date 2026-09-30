import { isAstralProjectionSource, isOpticallyPresent } from '../physicalVision/physicalDetectionMode';

/**
 * Whether lights that grant vision must not reveal the target: it isn't there to physical eyes, or every viewer is
 * a projected form without physical senses. A perceiving body still sees by light.
 */
export const shouldSuppressPhysicalLightVision = (
    target: object | null | undefined,
    visionSources: Iterable<foundry.canvas.sources.PointVisionSource>,
) => {
    if (target instanceof foundry.canvas.placeables.Token && !isOpticallyPresent(target)) return true;
    const activeSources = Array.from(visionSources).filter(source => source.active);
    return activeSources.length > 0 && activeSources.every(source => isAstralProjectionSource(source));
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
