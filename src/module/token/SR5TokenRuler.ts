import { FLAGS, SYSTEM_NAME } from '../constants';
import { SwarmTileHooks } from './SwarmTileHooks';

const Color = foundry.utils.Color;

export class SR5TokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {
    override _getGridHighlightStyle(
        waypoint: foundry.canvas.placeables.tokens.TokenRuler.Waypoint,
        offset: foundry.grid.BaseGrid.Offset3D
    ) {
        const highlightStyle = super._getGridHighlightStyle(waypoint, offset);

        try {
            SwarmTileHooks.clearSwarmRulerPreviews();
            const token = (this as any).token;
            if (token && typeof token._updateSwarmDragPosition === 'function') {
                token._updateSwarmDragPosition();
            }
        } catch (e) {}

        if (highlightStyle.alpha === 0) {
            return highlightStyle;
        }

        if (waypoint.action === 'walk') {
            highlightStyle.color = Color.from(game.settings.get(SYSTEM_NAME, FLAGS.TokenRulerColorWalking));
        }
        if (waypoint.action === 'run') {
            highlightStyle.color = Color.from(game.settings.get(SYSTEM_NAME, FLAGS.TokenRulerColorRunning));
        }
        if (waypoint.action === 'sprint') {
            highlightStyle.color = Color.from(game.settings.get(SYSTEM_NAME, FLAGS.TokenRulerColorSprinting));
        }

        highlightStyle.alpha = game.settings.get(SYSTEM_NAME, FLAGS.TokenRulerOpacity) ?? undefined;

        return highlightStyle;
    }

    override _getSegmentStyle(waypoint: foundry.canvas.placeables.tokens.TokenRuler.Waypoint) {
        const segmentStyle = super._getSegmentStyle(waypoint);
        if (segmentStyle.width === 0) {
            return segmentStyle;
        }

        if (waypoint.action === 'walk') {
            segmentStyle.color = Color.from(game.settings.get(SYSTEM_NAME, FLAGS.TokenRulerColorWalking));
        }
        if (waypoint.action === 'run') {
            segmentStyle.color = Color.from(game.settings.get(SYSTEM_NAME, FLAGS.TokenRulerColorRunning));
        }
        if (waypoint.action === 'sprint') {
            segmentStyle.color = Color.from(game.settings.get(SYSTEM_NAME, FLAGS.TokenRulerColorSprinting));
        }

        return segmentStyle;
    }

    override clear() {
        try {
            SwarmTileHooks.clearSwarmRulerPreviews();
        } catch (e) {}
        return super.clear();
    }
}



