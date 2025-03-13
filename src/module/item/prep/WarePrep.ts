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

        // TODO: Should live in SR5 const
        const gradeModifiers = {
            standard: { essence: 1, avail: 0, cost: 1 },
            alpha: { essence: 0.8, avail: 2, cost: 1.2 },
            beta: { essence: 0.7, avail: 4, cost: 1.5 },
            delta: { essence: 0.5, avail: 8, cost: 2.5 },
            gamma: { essence: 0.4, avail: 12, cost: 5 },
            grey: {essence: 0.75, avail: 0, cost: 1.3},
            used: { essence: 1.25, avail: -4, cost: 0.75 },
        };

        const essenceMod = gradeModifiers[grade].essence ?? 1;
        const availMod = gradeModifiers[grade].avail ?? 0;
        const costMod = gradeModifiers[grade].cost ?? 1;

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