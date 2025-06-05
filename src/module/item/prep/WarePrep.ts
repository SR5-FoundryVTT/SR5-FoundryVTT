import { SR } from "../../constants";
import { Helpers } from "../../helpers";
import { ItemAvailabilityFlow } from "../flows/ItemAvailabilityFlow";
import { ItemCostFlow } from "../flows/ItemCostFlow";


/**
 * Prepare item data for Cyberware and Bioware items.
 */
export const WarePrep = {
    prepareBaseData(system: Item.SystemOfType<'bioware' | 'cyberware'>) {
        WarePrep.prepareGrade(system);
    },

    /**
     * Calculate values based on grade.
     *
     * @param item The item for additional data
     * @param technology The system technology section to be altered
     */
    prepareGrade(system: Item.SystemOfType<'bioware' | 'cyberware'>) {
        const rating = system.technology.rating || 0;
        const grade = system.grade;

        if (grade === 'standard') {
            system.technology.calculated.essence.value = system.essence;
            system.technology.calculated.essence.adjusted = false;
            return;
        }

        const essenceMod = SR.gradeModifiers[grade].essence ?? 1;
        const availMod = SR.gradeModifiers[grade].avail ?? 0;
        const costMod = SR.gradeModifiers[grade].cost ?? 1;

        // Alter essence values.
        const floatEssence = Number(system.essence || 0) * essenceMod;
        const actualEssence = Helpers.roundTo(floatEssence, 4);
        system.technology.calculated.essence.adjusted = true;

        // Alter availability values and code.
        let availability = String(system.technology.availability ?? 0);
        let availParts = ItemAvailabilityFlow.parseAvailibility(availability);
        if (!availParts) {
            availability += availMod !== 0 ? (availMod > 0 ? ` (+${availMod})` : ` (${availMod})`) : '';
        } else {
            const { value } = ItemAvailabilityFlow.prepareAvailabilityValue(availability, system.technology.calculated.availability.adjusted, rating);
            availParts = ItemAvailabilityFlow.parseAvailibility(value);
            const actualAvailibility = availParts.availability + availMod;
            availability = `${actualAvailibility}${availParts.restriction}`;
        }

        // Alter cost by grade modifier.
        const baseCost = Number(system.technology.cost ?? 0);
        const { value } = ItemCostFlow.prepareCostValue(baseCost, system.technology.calculated.cost.adjusted, rating);
        const actualCost = value * costMod;

        system.technology.calculated.essence.value = actualEssence;
        system.technology.calculated.availability.value = availability;
        system.technology.calculated.cost.value = actualCost;
    }
}
