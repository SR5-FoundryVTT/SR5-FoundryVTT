import AstralPerceptionDetectionMode from './astralPerception/astralPerceptionDetectionMode';
import AstralPerceptionBackgroundVisionShader  from './astralPerception/astralPerceptionBackgroundShader';
import ThermographicVisionDetectionMode from './thermographicVision/thermographicDetectionMode';
import LowlightVisionDetectionMode from './lowlightVision/lowlightDetectionMode';

export default class VisionConfigurator {
    static configureAstralPerception() {
        //todo: v10 foundry-vtt-types 
        //@ts-ignore
        CONFIG.Canvas.detectionModes.astralPerception = new AstralPerceptionDetectionMode({
            id: 'astralPerception',
            label: 'SR5.Vision.AstralPerception',
            //@ts-ignore
            type: DetectionMode.DETECTION_TYPES.SIGHT,
          });
  
        //@ts-ignore
        CONFIG.Canvas.visionModes.astralPerception = new VisionMode({
            id: 'astralPerception',
            label: 'SR5.Vision.AstralPerception',
            canvas: {
            //@ts-ignore
            shader: ColorAdjustmentsSamplerShader,
            uniforms: {
                saturation: 1,
                tint: AstralPerceptionBackgroundVisionShader.COLOR_TINT,
            },
            },
            lighting: {
            //@ts-ignore
            background: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
            //@ts-ignore
            illumination: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
            //@ts-ignore
            coloration: { visibility: VisionMode.LIGHTING_VISIBILITY.DISABLED },
            },
            vision: {
            darkness: { adaptive: false },
            defaults: {
                attenuation: 1,
                brightness: 0.5,
                saturation: -0.5,
                contrast: 1,
            },
            background: { shader: AstralPerceptionBackgroundVisionShader },
            },
        });
    }

    static configureThermographicVision() {
        //todo: v10 foundry-vtt-types 
        //@ts-ignore
        CONFIG.Canvas.detectionModes.thermographic = new ThermographicVisionDetectionMode({
            id: 'thermographic',
            label: 'SR5.Vision.ThermographicVision',
            //@ts-ignore
            type: DetectionMode.DETECTION_TYPES.SIGHT,
          });
    }

    static configureLowlight() {
        //todo: v10 foundry-vtt-types 
        //@ts-ignore
        CONFIG.Canvas.detectionModes.lowlight = new LowlightVisionDetectionMode({
            id: 'lowlight',
            label: 'SR5.Vision.LowLight',
            //@ts-ignore
            type: DetectionMode.DETECTION_TYPES.SIGHT,
          });
    }
  }
  