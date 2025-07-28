import { FLAGS, SYSTEM_NAME } from '../constants';

const Color = foundry.utils.Color;

export class SR5TokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {
    override _getGridHighlightStyle(
        waypoint: foundry.canvas.placeables.tokens.TokenRuler.Waypoint,
        offset: foundry.grid.BaseGrid.Offset3D
    ) {
        const highlightStyle = super._getGridHighlightStyle(waypoint, offset);

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
}
