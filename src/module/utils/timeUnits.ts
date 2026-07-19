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
    if (!interval || !interval.value) return 0;
    return interval.value * unitToSeconds(interval.unit);
}
