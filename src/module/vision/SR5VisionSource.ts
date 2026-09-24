import { ASTRAL_PERCEPTION_VISION_MODE } from './astralPerception/AstralPerceptionFlow';
import { PerceptionFlow } from './PerceptionFlow';
import { ULTRASOUND_RANGE_METERS, ULTRASOUND_VISION_MODE } from './ultrasoundVision/ultrasoundDetectionMode';

/**
 * Vision source with the SR5 senses that don't rely on light.
 *
 * Neither astral perception nor ultrasound is blinded by darkness. Ultrasound replaces normal vision
 * up to 50 meters and can't penetrate materials transparent to optical sensors, like glass (SR5#446),
 * so it collides with walls the way movement does.
 */
export class SR5VisionSource extends foundry.canvas.sources.PointVisionSource {
    override get isBlinded() {
        if (this.data.visionMode === ASTRAL_PERCEPTION_VISION_MODE) return false;
        if (this.data.visionMode === ULTRASOUND_VISION_MODE) return false;
        return super.isBlinded;
    }

    override _initialize(...args: Parameters<foundry.canvas.sources.PointVisionSource['_initialize']>) {
        super._initialize(...args);
        if (this.data.visionMode !== ULTRASOUND_VISION_MODE || !(this.data.radius > 0) || !canvas.dimensions) return;

        const range = PerceptionFlow.metersToSceneUnits(ULTRASOUND_RANGE_METERS, canvas.scene?.grid.units ?? 'm');
        this.data.radius = Math.min(this.data.radius, range * canvas.dimensions.distancePixels);
    }

    override _getPolygonConfiguration() {
        const config = super._getPolygonConfiguration();
        if (this.data.visionMode !== ULTRASOUND_VISION_MODE) return config;
        return { ...config, type: 'move' as const };
    }
}
