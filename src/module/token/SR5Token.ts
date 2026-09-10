import { FLAGS, SYSTEM_NAME } from '../constants';

import Token = foundry.canvas.placeables.Token;
import PrototypeTokenConfig = foundry.applications.sheets.PrototypeTokenConfig;

export class SR5Token extends foundry.canvas.placeables.Token {
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
