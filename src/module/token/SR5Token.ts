import {FLAGS, SYSTEM_NAME} from "../constants";
import { TrackType } from "../types/template/ConditionMonitorsModel";

export class SR5Token extends Token {
    override _drawBar(number: number, bar: PIXI.Graphics, data: NonNullable<ReturnType<TokenDocument['getBarAttribute']>>): boolean{
        const tokenHealthBars = game.settings.get(SYSTEM_NAME, FLAGS.TokenHealthBars);
        // FoundryVTT draws resource bars as full/good when the value is the
        // same as the max and empty/bad at 0 (colored along a gradient).
        // Shadowrun condition trackers count up from 0 to the maximum.
        // We flip the values from Shadowrun format to FoundryVTT format here
        // for drawing.
        if (tokenHealthBars && data && data.attribute.startsWith('track')) {
            const track = data as unknown as TrackType;
            track.value = track.max - track.value;
        }
        return super._drawBar(number, bar, data);
    }
}
