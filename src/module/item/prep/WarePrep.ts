import { SR } from "../../constants";
import { ItemAvailabilityFlow } from "../flows/ItemAvailabilityFlow";


/**
 * Prepare item data form Cyberware and Bioware items.
 */
export const WarePrep = {
    prepareBaseData(system: Shadowrun.WareData) {
        WarePrep.prepareGrade(system);
    },

    /**
     * Calculate values based on grade.
     * 
     * @param item The item for additional data
     * @param technology The system technology section to be altered
     */
    prepareGrade(system: Shadowrun.WareData) {
        const rating = system.technology.rating || 0;
        const grade = system.grade;

        if (grade === 'standard') return;

        const essenceMod = SR.gradeModifiers[grade].essence ?? 1;
        const availMod = SR.gradeModifiers[grade].avail ?? 0;
        const costMod = SR.gradeModifiers[grade].cost ?? 1;

        // Alter essence values.
        const actualEssence = Math.round((Number(system.essence.base) ?? 0) * essenceMod);

        // Alter availability values.
        let availability = String(system.technology.availability.base ?? 0);
        const availParts = ItemAvailabilityFlow.parseAvailibility(availability);
        if (!availParts) {
            availability += availMod !== 0 ? (availMod > 0 ? ` (+${availMod})` : ` (${availMod})`) : '';
        } else {
            const availabilityAdjusted = system.technology.availability.adjusted ?? false;
              
            const actualAvailibility = availabilityAdjusted
                ? availParts.availability * rating + availMod
                : availParts.availability + availMod;
            availability = `${actualAvailibility}${availParts.restriction}`;
        }

        // Alter cost values.
        const cost = Number(system.technology.cost.base ?? 0);
        const actualCost = cost * rating * costMod;


        system.essence.value = actualEssence;
        // Mark values as adjusted to not loose base values when changing sheet data.
        system.technology.availability.adjusted = true;
        system.technology.availability.value = availability;
        system.technology.cost.adjusted = true;
        system.technology.cost.value = actualCost;
    }
}