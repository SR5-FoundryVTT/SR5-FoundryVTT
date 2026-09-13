import { FLAGS, SYSTEM_NAME } from '../constants';
import { AstralRegionFlow } from '@/module/vision/astralRegions/AstralRegionFlow';

export class SR5Token extends foundry.canvas.placeables.Token {
    /**
     * Stop astral forms before astral boundaries, so drag previews and executed movement end in front
     * of them the same way they end in front of walls.
     */
    override constrainMovementPath(
        ...args: Parameters<foundry.canvas.placeables.Token['constrainMovementPath']>
    ): ReturnType<foundry.canvas.placeables.Token['constrainMovementPath']> {
        const [path, constrained] = super.constrainMovementPath(...args);
        if (args[1]?.ignoreWalls) return [path, constrained];
        // Keep previews wall-like, but let the document pre-movement hook reject executed crossings
        // in full and notify the acting user.
        if (!args[1]?.preview) return [path, constrained];
        const astralPath = AstralRegionFlow.constrainMovementPath(this.document, path as any);
        return astralPath ? [astralPath as typeof path, true] : [path, constrained];
    }

    override _getVisionBlindedStates() {
        const states = super._getVisionBlindedStates();
        if (this.document.sight.visionMode === 'astralPerception') states.blind = false;
        return states;
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
