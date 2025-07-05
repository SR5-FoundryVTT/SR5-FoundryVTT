import { FLAGS, SYSTEM_NAME } from '../constants';
import { RoutingLibIntegration } from '../integrations/routingLibIntegration';
import { TrackType } from "../types/template/ConditionMonitors";

export class SR5Token extends foundry.canvas.placeables.Token {
    override _drawBar(number: number, bar: PIXI.Graphics, data: NonNullable<TokenDocument.GetBarAttributeReturn>) {
        const tokenHealthBars = game.settings.get(SYSTEM_NAME, FLAGS.TokenHealthBars);
        // FoundryVTT draws resource bars as full/good when the value is the
        // same as the max and empty/bad at 0 (colored along a gradient).
        // Shadowrun condition trackers count up from 0 to the maximum.
        // We flip the values from Shadowrun format to FoundryVTT format here
        // for drawing.
        if (tokenHealthBars && data?.attribute.startsWith('track')) {
            const track = data as unknown as TrackType;
            track.value = track.max - track.value;
        }
        return super._drawBar(number, bar, data);
    }

    override findMovementPath(
        waypoints: Token.FindMovementPathWaypoint[],
        options?: Token.FindMovementPathOptions & { skipRoutingLib?: boolean; }
    ) {
        const movement = this.actor?.system.movement;
        if (RoutingLibIntegration.routingLibReady && movement && !options?.skipRoutingLib) {
            return RoutingLibIntegration.routinglibPathfinding(waypoints, this, movement);
        }

        return super.findMovementPath(waypoints, options);
    }
}
