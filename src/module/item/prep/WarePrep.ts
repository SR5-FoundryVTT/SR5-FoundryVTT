import { SR } from "../../constants";
import { Helpers } from "../../helpers";
import { ItemAvailabilityFlow } from "../flows/ItemAvailabilityFlow";


/**
 * Prepare item data for Cyberware and Bioware items.
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
        const floatEssence = Number(system.essence || 0) * essenceMod;
        const actualEssence = Helpers.roundTo(floatEssence, 4);

        // Alter availability values.
        let availability = String(system.technology.availability ?? 0);
        const availParts = ItemAvailabilityFlow.parseAvailibility(availability);
        if (!availParts) {
            availability += availMod !== 0 ? (availMod > 0 ? ` (+${availMod})` : ` (${availMod})`) : '';
        } else {
            const availabilityAdjusted = system.technology.calculated.availability.adjusted ?? false;

            const actualAvailibility = availabilityAdjusted
                ? availParts.availability * rating + availMod
                : availParts.availability + availMod;
            availability = `${actualAvailibility}${availParts.restriction}`;
        }

        // Alter cost values.
        const cost = Number(system.technology.cost ?? 0);
        const costAdjusted = system.technology.calculated.cost.adjusted ?? false;

        const actualCost = costAdjusted
            ? cost * rating * costMod
            : cost * costMod;


        system.technology.calculated.essence = actualEssence;
        system.technology.calculated.availability.value = availability;
        system.technology.calculated.cost.value = actualCost;
    }
}
