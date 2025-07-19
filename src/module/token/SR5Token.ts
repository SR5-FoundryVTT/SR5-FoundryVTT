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
        const useRoutLib = this.document.getFlag(SYSTEM_NAME, FLAGS.TokenUseRoutingLib) ?? true;
        if (RoutingLibIntegration.routingLibReady && movement && useRoutLib && !options?.skipRoutingLib && !options?.ignoreWalls) {
            return RoutingLibIntegration.routinglibPathfinding(waypoints, this, movement);
        }

        return super.findMovementPath(waypoints, options);
    }

    static tokenConfig(app, html, data, options) {
        if (!RoutingLibIntegration.routingLibReady || !app.actor?.system?.movement) return;

        // Default it to true, so that it is enabled by default.
        const flagValue = app.token.getFlag(SYSTEM_NAME, FLAGS.TokenUseRoutingLib) ?? true;
        const id = `${app.id}-${FLAGS.TokenUseRoutingLib}`;

        const settingDiv = $(`
            <div class="form-group">
                <label for="${id}">${game.i18n.localize("SETTINGS.TokenUseRoutingLib")}</label>
                <div class="form-fields">
                    <input type="checkbox"
                        name="flags.${SYSTEM_NAME}.${FLAGS.TokenUseRoutingLib}"
                        id="${id}"
                        ${flagValue ? 'checked' : ''}>
                </div>
            </div>
        `);

        $(html).find('label[for$="-movementAction"]').closest('div.form-group').after(settingDiv);
    }
}
