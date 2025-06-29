import { FLAGS, SYSTEM_NAME } from '../constants';

// @ts-expect-error outdated typings
const Color = foundry.utils.Color;

// @ts-expect-error not yet included in typings
export class SR5TokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {
    _getGridHighlightStyle(waypoint, offset) {
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

        highlightStyle.alpha = game.settings.get(SYSTEM_NAME, FLAGS.TokenRulerOpacity);

        return highlightStyle;
    }

    _getSegmentStyle(waypoint) {
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
