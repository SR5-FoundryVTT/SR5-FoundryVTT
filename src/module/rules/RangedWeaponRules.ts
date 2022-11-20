import { SR } from "../constants";
import { Helpers } from "../helpers";
import RangesTemplateData = Shadowrun.RangesTemplateData;
import RangeTemplateData = Shadowrun.RangeTemplateData;

/**
 * Shadowrun5e rules applying to ranged weapons in general.
 */
export const RangedWeaponRules = {
    /**
     * Apply a distance to a selected target to the configured ranges of the used ranged weapon
     * to determine which range matches the distance.
     * 
     * Apply ranges according to SR5#175 section 'Range'.
     * Assume that a distance matches a range up until it's farthest and lowest given value
     * in the 'Range Table' SR5#185 (i.e. the weapon item range configuration).
     * 
     * @param distance Distance from the ranged weapon to the target in meters.
     * @param ranges Configured weapon ranges in meters taken from the weapon item configuration.
     * @returns The matching weapon range for the given distance.
     */
    getRangeForTargetDistance(distance: number, ranges: RangesTemplateData): RangeTemplateData {
        // Assume ranges to be in ASC order and to define their max range.
        // Should no range be found, assume distance to be out of range.
        const rangeKey = Object.keys(ranges).find(range => distance <= ranges[range].distance);
        if (rangeKey) {
            return ranges[rangeKey];
        } else {
            const {extreme} = ranges;
            return Helpers.createRangeDescription('SR5.OutOfRange', extreme.distance, SR.combat.environmental.range_modifiers.out_of_range);
        }
    }
}