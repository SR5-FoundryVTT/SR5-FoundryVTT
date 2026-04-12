import AstralPerceptionDetectionMode from './astralPerception/astralPerceptionDetectionMode';
import AstralPerceptionBackgroundVisionShader  from './astralPerception/astralPerceptionBackgroundShader';
import ThermographicVisionDetectionMode from './thermographicVision/thermographicDetectionMode';
import ThermographicVisionBackgroundVisionShader from './thermographicVision/thermographicBackgroundShader';
import LowlightVisionDetectionMode from './lowlightVision/lowlightDetectionMode';
import LowLightBackgroundVisionShader from './lowlightVision/lowlightBackgroundShader';
import AugmentedRealityVisionDetectionMode from './augmentedReality/arDetectionMode';
import AugmentedRealityVisionBackgroundVisionShader from './augmentedReality/arBackgroundShader';

export default class VisionConfigurator {
    static configureAstralPerception() {
        CONFIG.Canvas.detectionModes.astralPerception = new AstralPerceptionDetectionMode({
            id: 'astralPerception',
            label: 'SR5.Vision.AstralPerception',
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

        CONFIG.Canvas.visionModes.thermographic = new foundry.canvas.perception.VisionMode({
            id: 'thermographic',
            label: 'SR5.Vision.ThermographicVision',
            canvas: {
                shader: foundry.canvas.rendering.shaders.AmplificationSamplerShader,
                uniforms: {
                    saturation: -0.2,
                    tint: ThermographicVisionBackgroundVisionShader.COLOR_TINT,
                },
            },
            lighting: {
                background: { visibility: foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY.REQUIRED },
                levels: {
                    [foundry.canvas.perception.VisionMode.LIGHTING_LEVELS.DIM]: foundry.canvas.perception.VisionMode.LIGHTING_LEVELS.BRIGHT,
                },
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 0, contrast: 0, saturation: -0.2, brightness: 0.25 },
                background: { shader: ThermographicVisionBackgroundVisionShader },
            },
        });
    }

    static configureLowlight() {
        CONFIG.Canvas.detectionModes.lowlight = new LowlightVisionDetectionMode({
            id: 'lowlight',
            label: 'SR5.Vision.LowLight',
            type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT,
        });

        CONFIG.Canvas.visionModes.lowlight = new foundry.canvas.perception.VisionMode({
            id: 'lowlight',
            label: 'SR5.Vision.LowLight',
            canvas: {
                shader: foundry.canvas.rendering.shaders.AmplificationSamplerShader,
                uniforms: {
                    saturation: -0.4,
                    tint: LowLightBackgroundVisionShader.COLOR_TINT,
                },
            },
            lighting: {
                background: { visibility: foundry.canvas.perception.VisionMode.LIGHTING_VISIBILITY.REQUIRED },
                levels: {
                    [foundry.canvas.perception.VisionMode.LIGHTING_LEVELS.DIM]: foundry.canvas.perception.VisionMode.LIGHTING_LEVELS.BRIGHT,
                },
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 0, contrast: 0, saturation: -0.4, brightness: 0.5 },
                background: { shader: LowLightBackgroundVisionShader },
            },
        });
    }

    static configureAR() {
        CONFIG.Canvas.detectionModes.augmentedReality = new AugmentedRealityVisionDetectionMode({
            id: 'augmentedReality',
            label: 'SR5.Vision.AugmentedReality',
            type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT,
        });

        CONFIG.Canvas.visionModes.augmentedReality = new foundry.canvas.perception.VisionMode({
            id: 'augmentedReality',
            label: 'SR5.Vision.AugmentedReality',
            canvas: {
                shader: foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader,
                uniforms: {
                    contrast: 0.1,
                    saturation: 0.2,
                    tint: AugmentedRealityVisionBackgroundVisionShader.COLOR_TINT,
                },
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 0, contrast: 0.1, saturation: 0.2, brightness: 0.1 },
                background: { shader: AugmentedRealityVisionBackgroundVisionShader },
            },
        });
    }
}
  