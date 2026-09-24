import AstralPerceptionDetectionMode from './astralPerception/astralPerceptionDetectionMode';
import AstralPerceptionBackgroundVisionShader  from './astralPerception/astralPerceptionBackgroundShader';
import ThermographicVisionDetectionMode from './thermographicVision/thermographicDetectionMode';
import LowlightVisionDetectionMode from './lowlightVision/lowlightDetectionMode';
import AugmentedRealityVisionDetectionMode from './augmentedReality/arDetectionMode';
import UltrasoundDetectionMode, { ULTRASOUND_VISION_MODE } from './ultrasoundVision/ultrasoundDetectionMode';
import {
    PhysicalLightPerceptionDetectionMode,
    PhysicalSightDetectionMode,
} from './physicalVision/physicalDetectionMode';
import { AstralAwareCanvasVisibility } from './astralPerception/astralVisibility';
import { SR5VisionSource } from './SR5VisionSource';

export default class VisionConfigurator {
    static configurePhysicalSight() {
        const basicSight = CONFIG.Canvas.detectionModes.basicSight;
        const lightPerception = CONFIG.Canvas.detectionModes.lightPerception;
        CONFIG.Canvas.detectionModes.basicSight = new PhysicalSightDetectionMode(
            basicSight.toObject(),
        ) as unknown as typeof basicSight;
        CONFIG.Canvas.detectionModes.lightPerception = new PhysicalLightPerceptionDetectionMode(
            lightPerception.toObject(),
        ) as unknown as typeof lightPerception;
    }

    static configureAstralPerception() {
        CONFIG.Canvas.visionSourceClass = SR5VisionSource as unknown as typeof CONFIG.Canvas.visionSourceClass;
        CONFIG.Canvas.groups.visibility.groupClass = AstralAwareCanvasVisibility as unknown as
            typeof CONFIG.Canvas.groups.visibility.groupClass;
        CONFIG.Canvas.detectionModes.astralPerception = new AstralPerceptionDetectionMode({
            id: 'astralPerception',
            label: 'SR5.Vision.AstralPerception',
            walls: true,
            type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT,
        });
  
        CONFIG.Canvas.visionModes.astralPerception = new foundry.canvas.perception.VisionMode({
            id: 'astralPerception',
            label: 'SR5.Vision.AstralPerception',
            canvas: {
                shader: foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader,
                uniforms: {
                    saturation: 5,
                    tint: AstralPerceptionBackgroundVisionShader.COLOR_TINT,
                },
            },
            lighting: {
                background: { visibility: foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY.DISABLED },
                illumination: { visibility: foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY.DISABLED },
                coloration: { visibility: foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY.DISABLED },
            },
            vision: {
                darkness: { adaptive: false },
                background: { shader: AstralPerceptionBackgroundVisionShader },
            },
        });
    }

    static configureThermographicVision() {
        CONFIG.Canvas.detectionModes.thermographic = new ThermographicVisionDetectionMode({
            id: 'thermographic',
            label: 'SR5.Vision.ThermographicVision',
            type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT,
        });
    }

    static configureLowlight() {
        CONFIG.Canvas.detectionModes.lowlight = new LowlightVisionDetectionMode({
            id: 'lowlight',
            label: 'SR5.Vision.LowLight',
            type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT,
        });
    }

    static configureUltrasound() {
        CONFIG.Canvas.detectionModes.ultrasound = new UltrasoundDetectionMode({
            id: 'ultrasound',
            label: 'SR5.Vision.Ultrasound',
            walls: true,
            angle: false,
            type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SOUND,
        });

        // Ultrasound replaces normal vision with a colorless map of shapes and textures that ignores light.
        // It is based on Foundry's tremorsense, tinted gray like the ultrasound detection outline.
        const { LIGHTING_VISIBILITY } = foundry.canvas.perception.VisionMode;
        const { shaders } = foundry.canvas.rendering;
        CONFIG.Canvas.visionModes.ultrasound = new foundry.canvas.perception.VisionMode({
            id: ULTRASOUND_VISION_MODE,
            label: 'SR5.Vision.Ultrasound',
            canvas: {
                shader: shaders.ColorAdjustmentsSamplerShader,
                uniforms: { contrast: 0, saturation: -1, exposure: -0.65, tint: [0.75, 0.75, 0.75] },
            },
            lighting: {
                background: { visibility: LIGHTING_VISIBILITY.DISABLED },
                illumination: { visibility: LIGHTING_VISIBILITY.DISABLED },
                coloration: { visibility: LIGHTING_VISIBILITY.DISABLED },
                darkness: { visibility: LIGHTING_VISIBILITY.DISABLED },
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 0, contrast: 0.2, saturation: -1, brightness: 1 },
                background: { shader: shaders.WaveBackgroundVisionShader },
                coloration: { shader: shaders.WaveColorationVisionShader },
            },
        }, { animated: true });
    }

    static configureAR() {
        CONFIG.Canvas.detectionModes.augmentedReality = new AugmentedRealityVisionDetectionMode({
            id: 'augmentedReality',
            label: 'SR5.Vision.AugmentedReality',
            type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT,
        });
    }
}
