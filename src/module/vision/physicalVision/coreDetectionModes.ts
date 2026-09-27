import {
    hasPhysicalPresence,
    isAstralVisionSource,
    isOpticallyPresent,
} from '@/module/vision/physicalVision/physicalDetectionMode';

const { DetectionModeAll, DetectionModeInvisibility, DetectionModeTremor } = foundry.canvas.perception;

type InvisibilityArgs = Parameters<foundry.canvas.perception.DetectionModeInvisibility['_canDetect']>;
type TremorArgs = Parameters<foundry.canvas.perception.DetectionModeTremor['_canDetect']>;
type AllArgs = Parameters<foundry.canvas.perception.DetectionModeAll['_canDetect']>;

/**
 * Foundry's see and sense invisibility, limited to the physical plane.
 *
 * Invisibility spells hide a physical subject; they don't let physical senses reach the astral plane, so purely
 * astral beings stay undetected. A manifesting being is a visible image, so these senses can pick it up.
 */
export class PhysicalInvisibilityDetectionMode extends DetectionModeInvisibility {
    override _canDetect(...args: InvisibilityArgs) {
        return !isAstralVisionSource(args[0]) && isOpticallyPresent(args[1]) && super._canDetect(...args);
    }
}

/** Foundry's tremorsense, which needs a body touching the ground: astral and manifesting beings have none. */
export class PhysicalTremorDetectionMode extends DetectionModeTremor {
    override _canDetect(...args: TremorArgs) {
        return !isAstralVisionSource(args[0]) && hasPhysicalPresence(args[1]) && super._canDetect(...args);
    }
}

/**
 * Foundry's see and sense all, limited to what exists on the physical plane. Astral beings are only perceived
 * astrally, and an astral viewer keeps its aura rendering instead of this mode's outline.
 */
export class PhysicalAllDetectionMode extends DetectionModeAll {
    override _canDetect(...args: AllArgs) {
        return !isAstralVisionSource(args[0]) && isOpticallyPresent(args[1]) && super._canDetect(...args);
    }
}
