import { SR } from "../constants";

export interface WorldTimePreset {
    labelKey: string;
    seconds: number;
}

/**
 * Handle world time changes and formatting for the Time Control application
 * and the extended test manager time strip.
 *
 * Interval math is done in plain seconds, the world calendar is only used
 * for display formatting and component conversion.
 */
export const WorldTimeFlow = {
    /**
     * Predefined time steps offered as buttons.
     */
    get PRESETS(): WorldTimePreset[] {
        return [
            { labelKey: 'SR5.TimeControl.Presets.CombatTurn', seconds: SR.combat.ROUND_TIME_SECONDS },
            { labelKey: 'SR5.TimeControl.Presets.Minute', seconds: 60 },
            { labelKey: 'SR5.TimeControl.Presets.TenMinutes', seconds: 600 },
            { labelKey: 'SR5.TimeControl.Presets.Hour', seconds: 3600 },
            { labelKey: 'SR5.TimeControl.Presets.Day', seconds: 86400 },
            { labelKey: 'SR5.TimeControl.Presets.Week', seconds: 604800 },
        ];
    },

    /**
     * Advance (positive) or rewind (negative) world time by the given seconds.
     */
    async shift(seconds: number) {
        if (!game.user?.isGM) {
            ui.notifications?.warn('SR5.TimeControl.GmOnly', { localize: true });
            return;
        }
        if (!seconds || Number.isNaN(seconds)) return;
        await game.time.advance(seconds);
    },

    /**
     * Set world time to an absolute value given as calendar components.
     */
    async setAbsolute(components: Partial<foundry.data.CalendarData.TimeComponents>) {
        if (!game.user?.isGM) {
            ui.notifications?.warn('SR5.TimeControl.GmOnly', { localize: true });
            return;
        }
        await game.time.set(WorldTimeFlow.componentsToTime(components));
    },

    /**
     * Convert absolute calendar components into world time seconds.
     */
    componentsToTime(components: Partial<foundry.data.CalendarData.TimeComponents>): number {
        return game.time.calendar.componentsToTime(components);
    },

    /**
     * Format a world time value using the world calendar.
     */
    format(worldTime: number = game.time.worldTime): string {
        return game.time.calendar.format(worldTime, 'timestamp');
    },

    /**
     * Preview the formatted result of shifting world time. Nothing is committed.
     */
    preview(deltaSeconds: number): string {
        return WorldTimeFlow.format(game.time.worldTime + deltaSeconds);
    },

    /**
     * Preview the formatted result of setting absolute components. Nothing is committed.
     */
    previewComponents(components: Partial<foundry.data.CalendarData.TimeComponents>): string {
        return WorldTimeFlow.format(WorldTimeFlow.componentsToTime(components));
    },
}
