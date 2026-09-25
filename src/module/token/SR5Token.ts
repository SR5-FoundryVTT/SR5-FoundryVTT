import { FLAGS, SYSTEM_NAME } from '../constants';
import { AstralRegionFlow } from '@/module/vision/astralRegions/AstralRegionFlow';
import { ULTRASOUND_VISION_MODE } from '@/module/vision/ultrasoundVision/ultrasoundDetectionMode';

export class SR5Token extends foundry.canvas.placeables.Token {
    /**
     * Let astral forms move through physical walls, and stop them before astral boundaries instead, so
     * drag previews and executed movement end in front of those the same way they end in front of walls.
     *
     * SR5#314 only the Earth is solid to an astral form, which scene walls don't model.
     */
    override constrainMovementPath(
        ...args: Parameters<foundry.canvas.placeables.Token['constrainMovementPath']>
    ): ReturnType<foundry.canvas.placeables.Token['constrainMovementPath']> {
        const [waypoints, options] = args;
        const [path, constrained] = AstralRegionFlow.isAstralOnly(this.document)
            ? super.constrainMovementPath(waypoints, { ...options, ignoreWalls: true })
            : super.constrainMovementPath(...args);
        if (args[1]?.ignoreWalls) return [path, constrained];
        // Keep previews wall-like, but let the document pre-movement hook reject executed crossings
        // in full and notify the acting user.
        if (!args[1]?.preview) return [path, constrained];
        const astralPath = AstralRegionFlow.constrainMovementPath(this.document, path as any);
        return astralPath ? [astralPath as typeof path, true] : [path, constrained];
    }

    /**
     * Astral perception and ultrasound vision disable scene lighting, so a token they don't detect through
     * their own detection mode, like the observer's own token or a target found by basic sight, renders
     * unlit and disappears into the dark. Outline it the way that sense outlines what it detects.
     */
    override get isVisible() {
        const visible = super.isVisible;
        if (visible && !this.detectionFilter) this.detectionFilter = SR5Token.nonOpticalSenseFilter();
        return visible;
    }

    /** The detection filter of the non-optical vision mode every active vision source shares, if any. */
    private static nonOpticalSenseFilter() {
        const active = canvas.effects.visionSources.filter(source => source.active);
        const modes = new Set(active.map(source => source.visionMode?.id));
        if (modes.size !== 1) return null;
        const [mode] = modes;
        if (mode !== 'astralPerception' && mode !== ULTRASOUND_VISION_MODE) return null;
        const detectionMode = CONFIG.Canvas.detectionModes[mode]?.constructor as
            typeof foundry.canvas.perception.DetectionMode | undefined;
        return detectionMode?.getDetectionFilter() ?? null;
    }

    /** Astral perception and ultrasound aren't optical, and ultrasound works in any light. */
    override _getVisionBlindedStates() {
        const states = super._getVisionBlindedStates();
        const { visionMode } = this.document.sight;
        if (visionMode === 'astralPerception' || visionMode === ULTRASOUND_VISION_MODE) states.blind = false;
        if (visionMode === ULTRASOUND_VISION_MODE) states.darkness = false;
        return states;
    }

    override _onUpdate(...args: Parameters<foundry.canvas.placeables.Token['_onUpdate']>) {
        super._onUpdate(...args);

        const [changed] = args;
        if (foundry.utils.hasProperty(changed, `flags.${SYSTEM_NAME}.${FLAGS.TokenMovementPhaseMarkers}`)) {
            // The ruler reads these markers while displaying the token's movement history.
            this.renderFlags.set({ refreshRuler: true });
        }
    }

    override _drawBar(number: number, bar: PIXI.Graphics, data: NonNullable<TokenDocument.GetBarAttributeReturn>) {
        const tokenHealthBars = game.settings.get(SYSTEM_NAME, FLAGS.TokenHealthBars);
        // FoundryVTT draws resource bars as full/good when the value is the
        // same as the max and empty/bad at 0 (colored along a gradient).
        // Shadowrun condition trackers count up from 0 to the maximum.
        // We flip the values from Shadowrun format to FoundryVTT format here
        // for drawing.
        if (tokenHealthBars && data.type === 'bar' && data.attribute.startsWith('track')) {
            data.value = data.max - data.value;
        }
        return super._drawBar(number, bar, data);
    }
}
