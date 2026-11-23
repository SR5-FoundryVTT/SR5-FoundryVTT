import { isAstralVisionMode } from './astralPerception/astralVisionModes';
import { ULTRASOUND_VISION_MODE } from './ultrasoundVision/ultrasoundDetectionMode';

/** Whether a vision mode senses without light: astral sight or ultrasound. */
export const isNonOpticalVisionMode = (mode: string | null | undefined) =>
    isAstralVisionMode(mode) || mode === ULTRASOUND_VISION_MODE;

/**
 * Vision source with the SR5 senses that don't rely on light.
 *
 * Neither astral sight nor ultrasound is blinded by darkness. Ultrasound can't penetrate materials
 * transparent to optical sensors, like glass (SR5#446), so it collides with walls the way movement does.
 * Its radius is the token's vision range, which the GM controls.
 */
export class SR5VisionSource extends foundry.canvas.sources.PointVisionSource {
    override get isBlinded() {
        if (isNonOpticalVisionMode(this.data.visionMode)) return false;
        return super.isBlinded;
    }

    /** The drifting glow of astral sight and the sonar pings of ultrasound hold still in photosensitive mode. */
    override get isAnimated() {
        if (canvas.photosensitiveMode && isNonOpticalVisionMode(this.data.visionMode)) return false;
        return super.isAnimated;
    }

    override _getPolygonConfiguration() {
        const config = super._getPolygonConfiguration();
        if (this.data.visionMode !== ULTRASOUND_VISION_MODE) return config;
        return { ...config, type: 'move' as const };
    }
}
