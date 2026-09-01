import { FLAGS, SYSTEM_NAME } from '../constants';
import { MovementPhaseMarker } from './SR5TokenDocument';

const Color = foundry.utils.Color;
type TokenRuler = foundry.canvas.placeables.tokens.TokenRuler;
type Waypoint = foundry.canvas.placeables.tokens.TokenRuler.Waypoint;
type WaypointContext = NonNullable<ReturnType<foundry.canvas.placeables.tokens.TokenRuler['_getWaypointLabelContext']>>;

export class SR5TokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {
    static override WAYPOINT_LABEL_TEMPLATE = 'systems/shadowrun5e/dist/templates/hud/waypoint-label.hbs';

    /** Return the phase marker attached to the final waypoint of a recorded movement. */
    private _getMovementPhaseMarker(waypoint: Waypoint): MovementPhaseMarker | undefined {
        const markers = this.token.document.getFlag(SYSTEM_NAME, FLAGS.TokenMovementPhaseMarkers) ?? [];
        return markers.find(candidate =>
            candidate.movementId === waypoint.movementId
            && waypoint.next?.movementId !== candidate.movementId
        );
    }

    override _getWaypointLabelContext(
        waypoint: Waypoint,
        state: object,
    ) {
        const marker = this._getMovementPhaseMarker(waypoint);
        const context = super._getWaypointLabelContext(waypoint, state);
        if (!marker) return context;

        if (context) {
            (context as WaypointContext & { phaseMarker?: number }).phaseMarker = marker.pass;
            return context;
        }

        // Foundry hides some non-explicit waypoint labels. A phase endpoint still needs its badge.
        const uiScale = canvas.dimensions?.uiScale ?? 1;
        return {
            cssClass: 'sr5-phase-marker-only',
            phaseMarker: marker.pass,
            phaseMarkerOnly: true,
            uiScale,
            position: {
                x: waypoint.center.x,
                y: waypoint.center.y + (waypoint.next ? 0 : 0.5 * this.token.h) + (16 * uiScale),
            },
        } as unknown as WaypointContext;
    }

    /** Make completed action-phase endpoints visibly distinct from ordinary movement anchors. */
    override _getWaypointStyle(waypoint: Waypoint) {
        const waypointStyle = super._getWaypointStyle(waypoint);
        if (this._getMovementPhaseMarker(waypoint)) {
            waypointStyle.color = Color.from(game.settings.get(SYSTEM_NAME, FLAGS.TokenRulerColorPhaseMarker));
        }
        return waypointStyle;
    }

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
