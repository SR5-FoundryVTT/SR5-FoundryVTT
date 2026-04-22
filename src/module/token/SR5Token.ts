import { FLAGS, SYSTEM_NAME } from '../constants';
import { RoutingLibIntegration } from '../integrations/routingLibIntegration';
import { TrackType } from "../types/template/ConditionMonitors";
import { SR5VisionModeLabelKeys, SR5VisionModes, normalizeVisionModeId } from '../vision/visionModeState';

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
        const anchor = $(html).find('label[for$="-movementAction"]').closest('div.form-group');

        if (RoutingLibIntegration.routingLibReady && app.actor?.system?.movement) {
            const flagValue = app.token.getFlag(SYSTEM_NAME, FLAGS.TokenUseRoutingLib) ?? true;
            const id = `${app.id}-${FLAGS.TokenUseRoutingLib}`;

            const settingDiv = $(`
                <div class="form-group">
                    <label for="${id}">${game.i18n.localize('SETTINGS.TokenUseRoutingLib')}</label>
                    <div class="form-fields">
                        <input type="checkbox"
                            name="flags.${SYSTEM_NAME}.${FLAGS.TokenUseRoutingLib}"
                            id="${id}"
                            ${flagValue ? 'checked' : ''}>
                    </div>
                </div>
            `);

            if (anchor.length) {
                anchor.after(settingDiv);
            }
        }

        const modeAnchor = $(html).find(`input[name="flags.${SYSTEM_NAME}.${FLAGS.TokenUseRoutingLib}"]`).closest('div.form-group');
        const currentMode = normalizeVisionModeId(app.token.getFlag(SYSTEM_NAME, FLAGS.TokenActiveVisionMode)) ?? '';
        const modeOptions = [
            { value: '', label: game.i18n.localize('SR5.Vision.ActorDefault') },
            ...SR5VisionModes
                .filter(mode => mode === 'basic' || Boolean(CONFIG.Canvas.visionModes[mode]))
                .map(mode => ({
                    value: mode,
                    label: game.i18n.localize(SR5VisionModeLabelKeys[mode]),
                })),
        ];

        const optionsHtml = modeOptions
            .map(option => `<option value="${option.value}" ${option.value === currentMode ? 'selected' : ''}>${option.label}</option>`)
            .join('');

        const modeId = `${app.id}-${FLAGS.TokenActiveVisionMode}`;
        const modeSettingDiv = $(`
            <div class="form-group">
                <label for="${modeId}">${game.i18n.localize('SETTINGS.TokenActiveVisionMode')}</label>
                <div class="form-fields">
                    <select name="flags.${SYSTEM_NAME}.${FLAGS.TokenActiveVisionMode}" id="${modeId}">
                        ${optionsHtml}
                    </select>
                </div>
            </div>
        `);

        if (modeAnchor.length) {
            modeAnchor.after(modeSettingDiv);
            return;
        }

        if (anchor.length) {
            anchor.after(modeSettingDiv);
            return;
        }

        const sightAnchor = $(html).find('input[name="sight.range"]').closest('div.form-group');
        if (sightAnchor.length) {
            sightAnchor.after(modeSettingDiv);
            return;
        }

        $(html).find('form').append(modeSettingDiv);
    }
}
