import AstralPerceptionDetectionMode from './astralPerception/astralPerceptionDetectionMode';
import AstralPerceptionBackgroundVisionShader  from './astralPerception/astralPerceptionBackgroundShader';
import ThermographicVisionDetectionMode from './thermographicVision/thermographicDetectionMode';
import LowlightVisionDetectionMode from './lowlightVision/lowlightDetectionMode';
import AugmentedRealityVisionDetectionMode from './augmentedReality/arDetectionMode';

export default class VisionConfigurator {
    static configureAstralPerception() {
        //todo: v10 foundry-vtt-types 
        //@ts-expect-error // TODO: foundry-vtt-types v10
        CONFIG.Canvas.detectionModes.astralPerception = new AstralPerceptionDetectionMode({
            id: 'astralPerception',
            label: 'SR5.Vision.AstralPerception',
            //@ts-expect-error // TODO: foundry-vtt-types v10
            type: DetectionMode.DETECTION_TYPES.SIGHT,
          });
  
        //@ts-expect-error // TODO: foundry-vtt-types v10
        CONFIG.Canvas.visionModes.astralPerception = new VisionMode({
            id: 'astralPerception',
            label: 'SR5.Vision.AstralPerception',
            canvas: {
                //@ts-expect-error // TODO: foundry-vtt-types v10
                shader: ColorAdjustmentsSamplerShader,
                uniforms: {
                    saturation: 5,
                    tint: AstralPerceptionBackgroundVisionShader.COLOR_TINT,
                },
            },
            lighting: {
                //@ts-expect-error // TODO: foundry-vtt-types v10
                background: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
                //@ts-expect-error // TODO: foundry-vtt-types v10
                illumination: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
                //@ts-expect-error // TODO: foundry-vtt-types v10
                coloration: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
            },
            vision: {
                darkness: { adaptive: false },
                background: { shader: AstralPerceptionBackgroundVisionShader },
            },
        });
    }

    static configureThermographicVision() {
        //todo: v10 foundry-vtt-types 
        //@ts-expect-error // TODO: foundry-vtt-types v10
        CONFIG.Canvas.detectionModes.thermographic = new ThermographicVisionDetectionMode({
            id: 'thermographic',
            label: 'SR5.Vision.ThermographicVision',
            //@ts-expect-error // TODO: foundry-vtt-types v10
            type: DetectionMode.DETECTION_TYPES.SIGHT,
          });
    }

    static configureLowlight() {
        //todo: v10 foundry-vtt-types 
        //@ts-expect-error // TODO: foundry-vtt-types v10
        CONFIG.Canvas.detectionModes.lowlight = new LowlightVisionDetectionMode({
            id: 'lowlight',
            label: 'SR5.Vision.LowLight',
            //@ts-expect-error // TODO: foundry-vtt-types v10
            type: DetectionMode.DETECTION_TYPES.SIGHT,
          });
    }

    static configureAR() {
        //@ts-expect-error // TODO: foundry-vtt-types v10
        CONFIG.Canvas.detectionModes.augmentedReality = new AugmentedRealityVisionDetectionMode({
            id: 'augmentedReality',
            label: 'SR5.Vision.AugmentedReality',
            //@ts-expect-error // TODO: foundry-vtt-types v10
            type: DetectionMode.DETECTION_TYPES.SIGHT,
          });
    }
  }
  