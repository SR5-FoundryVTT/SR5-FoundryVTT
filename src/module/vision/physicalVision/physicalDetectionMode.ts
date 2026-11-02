import { isAstralForm } from '@/module/vision/astralProjection/AstralProjectionState';
import { isManifesting } from '@/module/vision/astralProjection/ManifestationState';
import {
    ASTRAL_PROJECTION_VISION_MODE,
    isAstralVisionMode,
} from '@/module/vision/astralPerception/astralVisionModes';

type DetectionTarget = Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>[1] | undefined;

/**
 * How a target exists on the physical plane.
 *
 * - solid: a physical body, which every physical sense and sensor can pick up.
 * - manifest: an astral being showing itself as a ghostly image. It is a psychic effect, so eyes see it but
 *   technological devices can't detect it (SR5#314).
 * - none: purely astral, invisible to physical senses.
 */
export type PhysicalPresence = 'solid' | 'manifest' | 'none';

export const getPhysicalTargetActor = (target: DetectionTarget) => {
    const document = (target as { document?: { actor?: Actor.Implementation | null } } | null)?.document;
    return document?.actor ?? null;
};

export const getPhysicalPresence = (target: DetectionTarget): PhysicalPresence => {
    const token = (target as { document?: TokenDocument } | null)?.document;
    const actor = getPhysicalTargetActor(target);
    // A form shares its body's actor, so only the form turns ghostly when that actor manifests.
    if (token instanceof TokenDocument && isAstralForm(token)) return isManifesting(actor) ? 'manifest' : 'none';
    if (!actor || actor.system.visibilityChecks.targets.physical.hasBody !== false) return 'solid';
    return isManifesting(actor) ? 'manifest' : 'none';
};

/** Whether technological sensors and non-optical senses, like thermographic, ultrasound or touch, pick the target up. */
export const hasPhysicalPresence = (target: DetectionTarget) => getPhysicalPresence(target) === 'solid';

/** Whether physical eyes see the target, which includes manifesting astral beings. */
export const isOpticallyPresent = (target: DetectionTarget) => getPhysicalPresence(target) !== 'none';

export const isInvisiblePhysicalTarget = (target: DetectionTarget) => {
    return getPhysicalTargetActor(target)?.statuses.has(CONFIG.specialStatusEffects.INVISIBLE) ?? false;
};

type VisionSourceLike = { visionMode?: { id?: string | null } | null } | null | undefined;

/**
 * Whether a vision source belongs to a projected astral form, which has no physical senses (SR5#313).
 * A perceiving body stays dual-natured, so its physical senses keep working.
 */
export const isAstralProjectionSource = (visionSource: VisionSourceLike) =>
    visionSource?.visionMode?.id === ASTRAL_PROJECTION_VISION_MODE;

/** Whether a vision source senses the astral plane, by perceiving or projecting. */
export const isAstralSightSource = (visionSource: VisionSourceLike) => isAstralVisionMode(visionSource?.visionMode?.id);

export class PhysicalSightDetectionMode extends foundry.canvas.perception.DetectionMode {
    override _canDetect(...args: Parameters<foundry.canvas.perception.DetectionMode['_canDetect']>) {
        return !isAstralProjectionSource(args[0])
            && isOpticallyPresent(args[1])
            && !isInvisiblePhysicalTarget(args[1])
            && super._canDetect(...args);
    }
}

export class PhysicalLightPerceptionDetectionMode extends PhysicalSightDetectionMode {
    override _testPoint(
        ...args: Parameters<foundry.canvas.perception.DetectionMode['_testPoint']>
    ) {
        return super._testPoint(...args) && canvas.effects.testInsideLight(args[3].point);
    }
}
