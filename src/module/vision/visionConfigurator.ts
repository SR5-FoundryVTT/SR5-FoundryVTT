import AstralPerceptionDetectionMode from './astralPerception/astralPerceptionDetectionMode';
import { AstralBackgroundVisionShader } from './astralPerception/astralShaders';
import ThermographicVisionDetectionMode from './thermographicVision/thermographicDetectionMode';
import LowlightVisionDetectionMode from './lowlightVision/lowlightDetectionMode';
import AugmentedRealityVisionDetectionMode from './augmentedReality/arDetectionMode';
import UltrasoundDetectionMode, { ULTRASOUND_VISION_MODE } from './ultrasoundVision/ultrasoundDetectionMode';
import {
    ULTRASOUND_COLOR,
    UltrasoundBackgroundVisionShader,
    UltrasoundColorationVisionShader,
} from './ultrasoundVision/ultrasoundShaders';
import {
    PhysicalLightPerceptionDetectionMode,
    PhysicalSightDetectionMode,
} from './physicalVision/physicalDetectionMode';
import {
    PhysicalAllDetectionMode,
    PhysicalInvisibilityDetectionMode,
    PhysicalTremorDetectionMode,
} from './physicalVision/coreDetectionModes';
import { MANIFEST_STATUS, MATERIALIZE_STATUS } from './astralProjection/ManifestationState';
import { AstralAwareCanvasVisibility } from './astralPerception/astralVisibility';
import { SR5VisionSource } from './SR5VisionSource';

export default class VisionConfigurator {
    static configurePhysicalSight() {
        const modes = CONFIG.Canvas.detectionModes;
        const replace = (id: string, Mode: typeof foundry.canvas.perception.DetectionMode) => {
            const mode = modes[id];
            if (mode) modes[id] = new Mode(mode.toObject()) as unknown as typeof mode;
        };
        replace('basicSight', PhysicalSightDetectionMode);
        replace('lightPerception', PhysicalLightPerceptionDetectionMode);
        // Foundry's other senses stay on the physical plane as well.
        replace('seeInvisibility', PhysicalInvisibilityDetectionMode);
        replace('senseInvisibility', PhysicalInvisibilityDetectionMode);
        replace('feelTremor', PhysicalTremorDetectionMode);
        replace('seeAll', PhysicalAllDetectionMode);
        replace('senseAll', PhysicalAllDetectionMode);
    }

    /** Let tokens react when their actor manifests or materializes, see SR5Token._onApplyStatusEffect. */
    static configureStatuses() {
        const special = CONFIG.specialStatusEffects as Record<string, string>;
        special.MANIFEST = MANIFEST_STATUS;
        special.MATERIALIZE = MATERIALIZE_STATUS;
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

        // SR5#312 the astral plane is always lit by the glow of life, so no scene lighting or darkness applies.
        const { LIGHTING_VISIBILITY } = foundry.canvas.perception.VisionMode;
        CONFIG.Canvas.visionModes.astralPerception = new foundry.canvas.perception.VisionMode({
            id: 'astralPerception',
            label: 'SR5.Vision.AstralPerception',
            canvas: {
                shader: foundry.canvas.rendering.shaders.ColorAdjustmentsSamplerShader,
                uniforms: { contrast: -0.15, saturation: -0.9, exposure: -0.45 },
            },
            lighting: {
                background: { visibility: LIGHTING_VISIBILITY.DISABLED },
                illumination: { visibility: LIGHTING_VISIBILITY.DISABLED },
                coloration: { visibility: LIGHTING_VISIBILITY.DISABLED },
                darkness: { visibility: LIGHTING_VISIBILITY.DISABLED },
            },
            vision: {
                darkness: { adaptive: false },
                defaults: { attenuation: 0, contrast: -0.1, saturation: -0.85, brightness: 1 },
                background: { shader: AstralBackgroundVisionShader },
            },
        }, { animated: true });
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
                uniforms: { contrast: 0, saturation: -1, exposure: -0.65, tint: ULTRASOUND_COLOR },
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
                background: { shader: UltrasoundBackgroundVisionShader },
                coloration: { shader: UltrasoundColorationVisionShader },
            },
        }, { animated: true });
    }

    static configureAR() {
        CONFIG.Canvas.detectionModes.augmentedReality = new AugmentedRealityVisionDetectionMode({
            id: 'augmentedReality',
            label: 'SR5.Vision.AugmentedReality',
            type: foundry.canvas.perception.DetectionMode.DETECTION_TYPES.SIGHT,
            // Icons are spotted through the antenna, not line of sight (SR5#235).
            walls: false,
            angle: false,
        });
    }
}
