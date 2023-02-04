import { SR5Actor } from "../actor/SR5Actor";
import { SR } from "../constants";
import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";
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
    },
    

    /**
     * Calculate recoil compensation based on SR5#175 'Recoil' including SR5#178
     * 
     * @param item 
     * @returns total amount of recoil compensation to be used when attacking with this item.
     */
    recoilCompensation(item: SR5Item): number {
        let compensation = item.recoilCompensation;
        if (item.actor) {
            compensation += item.actor.recoilCompensation;
        }
        return compensation;
    },

    /**
     * Calculate recoil compensation based on SR5#175 'Recoil' including SR5#178
     * 
     * @param actor 
     * @returns Partial amount of recoil compensation available to this actor
     */
    actorRecoilCompensation(actor: SR5Actor): number {
        // Each new attack allows one free compensation.
        if (actor.isVehicle()) return RangedWeaponRules._vehicleRecoilCompensation(actor);
        else return this._humanoidRecoilCompensation(actor);
    },

    /**
     * Vehicle use their own rc calculation according to SR5#176 'Vehicle and Drones and Mounted Weapons'
     * 
     * @returns The recoil compensation part a vehicle will add to the total recoil compensation.
     */
    _vehicleRecoilCompensation(actor: SR5Actor): number {
        if (!actor.isVehicle()) return 0;

        const body = actor.getAttribute('body');
        return body ? body.value : 0;
    },

    /**
     * Humanoid characters use the default rc calculation according to SR5#175 'Recoil'
     * 
     * A humanoid in this case is anything with physical attributes that's not a vehicle.
     * Matrix/Astral actors aren't included.
     * 
     * @returns The recoil compensation part a humanoid will add to the total recoil compensation.
     */
    _humanoidRecoilCompensation(actor: SR5Actor): number {
        if (actor.isVehicle() || actor.isIC() || actor.isSprite()) return 0;

        const baseRc = 1;
        const strength = actor.getAttribute('strength');
        return strength ? 
            Math.ceil(strength.value / 3) + baseRc:
            baseRc;
    }
}