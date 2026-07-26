import { FLAGS, SR, SYSTEM_NAME } from "../constants";

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
     * Put a fresh world onto the Shadowrun start date.
     *
     * Runs once and only while the world still sits at the FoundryVTT epoch, so an ongoing
     * campaign never has its clock reset.
     */
    async initialize() {
        if (!game.user?.isGM) return;
        if (game.settings.get(SYSTEM_NAME, FLAGS.WorldTimeInitialized) as boolean) return;

        if (game.time.worldTime === 0) {
            const worldTime = WorldTimeFlow.componentsToTime(SR.time.START_DATE);
            console.log(`Shadowrun 5e | Setting the world time to ${WorldTimeFlow.format(worldTime)}`);
            await game.time.set(worldTime);
        }

        await game.settings.set(SYSTEM_NAME, FLAGS.WorldTimeInitialized, true);
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
     * The year the world calendar shows for the FoundryVTT epoch.
     *
     * NOTE: Core declares the field but never applies it, while calendar modules do. Without
     * it our display drifts from theirs by this offset.
     */
    get yearZero(): number {
        return game.time.calendar.years?.yearZero ?? 0;
    },

    /**
     * Calendar components of a world time, as shown to a user. Only the year is shifted,
     * month and dayOfMonth stay zero based.
     */
    components(worldTime: number = game.time.worldTime): foundry.data.CalendarData.TimeComponents {
        const components = game.time.calendar.timeToComponents(worldTime);
        return { ...components, year: components.year + WorldTimeFlow.yearZero };
    },

    /**
     * Convert absolute calendar components, as displayed, into world time seconds.
     *
     * NOTE: CalendarData#componentsToTime ignores month and dayOfMonth, which would place
     * every date on January 1st. Fold them into the day of the year first.
     */
    componentsToTime(components: Partial<foundry.data.CalendarData.TimeComponents>): number {
        const year = components.year === undefined ? undefined : components.year - WorldTimeFlow.yearZero;
        return game.time.calendar.componentsToTime(WorldTimeFlow.withDayOfYear({ ...components, year }));
    },

    /**
     * Add the day of the year matching the given month and dayOfMonth, whose year is
     * expected in the calendars internal numbering.
     *
     * NOTE: month and dayOfMonth are kept alongside it on purpose. Core reads only day,
     * calendar modules may read only month and dayOfMonth. All three satisfies either.
     */
    withDayOfYear(components: Partial<foundry.data.CalendarData.TimeComponents>): Partial<foundry.data.CalendarData.TimeComponents> {
        const { month, dayOfMonth } = components;
        if (month === undefined && dayOfMonth === undefined) return components;

        const calendar = game.time.calendar;
        const months = calendar.months?.values ?? [];
        const leapYear = calendar.isLeapYear(components.year ?? 0);

        let day = 0;
        for (let index = 0; index < Math.min(month ?? 0, months.length); index++) {
            const value = months[index];
            day += (leapYear ? value.leapDays ?? value.days : value.days) ?? 0;
        }

        return { ...components, day: day + (dayOfMonth ?? 0) };
    },

    /**
     * Format a world time value as a timestamp of the world calendar.
     *
     * Mirrors CalendarData.formatTimestamp, which prints the unshifted year.
     */
    format(worldTime: number = game.time.worldTime): string {
        const { year, month, dayOfMonth, hour, minute, second } = WorldTimeFlow.components(worldTime);
        const ordinal = game.time.calendar.months?.values?.[month]?.ordinal ?? month + 1;

        const pad = (value: number, length = 2) => String(value).padStart(length, '0');
        return `${pad(year, 4)}-${pad(ordinal)}-${pad(dayOfMonth + 1)} ${pad(hour)}:${pad(minute)}:${pad(second)}`;
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
