import { ASTRAL_PERCEPTION_VISION_MODE } from './astralPerception/AstralPerceptionFlow';
import { ULTRASOUND_VISION_MODE } from './ultrasoundVision/ultrasoundDetectionMode';

/**
 * Vision source with the SR5 senses that don't rely on light.
 *
 * Neither astral perception nor ultrasound is blinded by darkness. Ultrasound can't penetrate materials
 * transparent to optical sensors, like glass (SR5#446), so it collides with walls the way movement does.
 * Its radius is the token's vision range, which the GM controls.
 */
export class SR5VisionSource extends foundry.canvas.sources.PointVisionSource {
    override get isBlinded() {
        if (this.data.visionMode === ASTRAL_PERCEPTION_VISION_MODE) return false;
        if (this.data.visionMode === ULTRASOUND_VISION_MODE) return false;
        return super.isBlinded;
    }

    override _getPolygonConfiguration() {
        const config = super._getPolygonConfiguration();
        if (this.data.visionMode !== ULTRASOUND_VISION_MODE) return config;
        return { ...config, type: 'move' as const };
    }
}
