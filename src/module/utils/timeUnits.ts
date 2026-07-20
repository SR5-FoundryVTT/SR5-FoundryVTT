import { SR } from "../constants";
import { ExtendedTestInterval, ExtendedIntervalUnit } from "../types/flows/ExtendedTest";

/**
 * Fixed second multipliers per interval unit.
 *
 * These are deliberately deterministic instead of calendar aware, so interval math
 * stays stable independent of the configured world calendar. The calendar is only
 * used for display formatting.
 */
const UNIT_SECONDS: Record<Exclude<ExtendedIntervalUnit, 'rounds'>, number> = {
    seconds: 1,
    minutes: 60,
    hours: 3600,
    days: 86400,
    weeks: 604800,
    months: 2592000,
};

/**
 * Seconds for a single unit of the given interval unit.
 */
export function unitToSeconds(unit: ExtendedIntervalUnit): number {
    if (unit === 'rounds') return CONFIG.time.roundTime || SR.combat.ROUND_TIME_SECONDS;
    return UNIT_SECONDS[unit];
}

/**
 * Convert an extended test interval into world time seconds.
 */
export function intervalToSeconds(interval: ExtendedTestInterval): number {
    if (!interval?.value) return 0;
    return interval.value * unitToSeconds(interval.unit);
}

/**
 * The localization key labeling a single interval unit.
 *
 * Combat rounds use the system label, all other units reuse the FoundryVTT effect
 * duration labels.
 */
export function unitLabelKey(unit: ExtendedIntervalUnit): Parameters<typeof game.i18n.localize>[0] {
    if (unit === 'rounds') return 'SR5.ActiveEffect.Duration.UnitTurns';
    return `EFFECT.DURATION.UNITS.${unit}` as Parameters<typeof game.i18n.localize>[0];
}

/**
 * The localized label of a single interval unit.
 */
export function unitLabel(unit: ExtendedIntervalUnit): string {
    return game.i18n.localize(unitLabelKey(unit));
}

/**
 * All interval units, in the order they're offered for selection.
 */
export const INTERVAL_UNITS: ExtendedIntervalUnit[] = [
    'rounds', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'months',
];
