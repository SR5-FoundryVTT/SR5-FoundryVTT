import { isAstralVisionMode } from './astralPerception/astralVisionModes';
import { ULTRASOUND_VISION_MODE } from './ultrasoundVision/ultrasoundDetectionMode';

/**
 * Vision source with the SR5 senses that don't rely on light.
 *
 * Neither astral sight nor ultrasound is blinded by darkness. Ultrasound can't penetrate materials
 * transparent to optical sensors, like glass (SR5#446), so it collides with walls the way movement does.
 * Its radius is the token's vision range, which the GM controls.
 */
export class SR5VisionSource extends foundry.canvas.sources.PointVisionSource {
    override get isBlinded() {
        if (isAstralVisionMode(this.data.visionMode)) return false;
        if (this.data.visionMode === ULTRASOUND_VISION_MODE) return false;
        return super.isBlinded;
    }

    /** The drifting glow of astral sight and the sonar pings of ultrasound hold still in photosensitive mode. */
    override get isAnimated() {
        const { visionMode } = this.data;
        const animatedBySR5 = isAstralVisionMode(visionMode) || visionMode === ULTRASOUND_VISION_MODE;
        if (canvas.photosensitiveMode && animatedBySR5) return false;
        return super.isAnimated;
    }

    override _getPolygonConfiguration() {
        const config = super._getPolygonConfiguration();
        if (this.data.visionMode !== ULTRASOUND_VISION_MODE) return config;
        return { ...config, type: 'move' as const };
    }
}
