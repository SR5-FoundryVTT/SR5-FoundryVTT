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
            const { extreme } = ranges;
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
            compensation += item.actor.recoilCompensation();
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
        if (actor.isType('vehicle')) return RangedWeaponRules.vehicleRecoilCompensation(actor);
        else return RangedWeaponRules.humanoidRecoilCompensation(actor);
    },

    /**
     * Vehicle use their own rc calculation according to SR5#176 'Vehicle and Drones and Mounted Weapons'
     * 
     * @returns The recoil compensation part a vehicle will add to the total recoil compensation.
     */
    vehicleRecoilCompensation(actor: SR5Actor): number {
        if (!actor.isType('vehicle')) return 0;

        const body = actor.getAttribute('body');
        return body ? body.value : 0;
    },

    /**
     * Calculate the actual recoil compensation for vehicles number from source values according to SR5#175 'Recoil'
     * 
     * @param body The body level of the vehicle
     */
    vehicleRecoilCompensationValue(body: number): number {
        return Math.max(body, 0);
    },

    /**
     * Humanoid characters use the default rc calculation according to SR5#175 'Recoil'
     * 
     * A humanoid in this case is anything with physical attributes that's not a vehicle.
     * Matrix/Astral actors aren't included.
     * 
     * @returns The recoil compensation part a humanoid will add to the total recoil compensation.
     */
    humanoidRecoilCompensation(actor: SR5Actor): number {
        const noBody = actor.asType('vehicle', 'ic', 'sprite');
        if (noBody) return 0;

        const strength = actor.getAttribute('strength');
        if (!strength) return 0;
        return RangedWeaponRules.humanoidRecoilCompensationValue(strength.value);
    },

    /**
     * Calculate the actual recoil compensation for humanoids number from source values according to SR5#175 'Recoil'
     * 
     * @param strength The strength level of the humanoid
     * @param baseRc The base recoil compensation 
     * @returns The recoil compensation for a humanoid
     */
    humanoidRecoilCompensationValue(strength: number): number {
        return Math.max(Math.ceil(strength / 3), 0);
    },

    /**
     * Free recoil compensation according to SR5#175 'Recoil'
     * @param baseRc Optional parameter allowing you to define a custom base rc.
     */
    humanoidBaseRecoilCompensation(baseRc: number = 1): number {
        return baseRc;
    },

    /**
     * The number of bullets when reloading during a complex action according to SR5#163 'Reloading Weapons'
     * @param clip The currently used clip
     * @param dex The owning actors dexterity value
     * @returns The number of bullets when reloading during a complex action or -1 if it can only be fully reloaded directly
     */
    partialReload(clip: string = '', dex: number = 1): number {
        switch (clip) {
            case 'internal_magazin':
            case 'cylinder':
                return dex;
            case 'break_action':
                return 2;
            case 'muzzle_loader':
            case 'bow':
                return 1;
            default:
                return -1;
        }
    }
}