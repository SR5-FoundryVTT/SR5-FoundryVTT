import { Helpers } from "../../../helpers";
import { PartsList } from "../../../parts/PartsList";
import { ItemAvailabilityFlow } from "../../flows/ItemAvailabilityFlow";
import { SR5Item } from "../../SR5Item";

/**
 * Item data preparation around the 'technology' template.json item template.
 */
export const TechnologyPrep = {
    /**
     * Calculate the device condition monitor
     * 
     * See SR5#228 'Matrix Damage'
     * @param technology The system technology section to be altered
     */
    prepareConditionMonitor(technology: Shadowrun.TechnologyData) {        
        // taMiF: This seems to be legacy code to avoid a migration.
        //        Leave it in, as it doesn't hurt for now.
        if (technology.condition_monitor === undefined) {
            technology.condition_monitor = { value: 0, max: 0, label: '' };
        }
        
        const rating = typeof technology.rating === 'string' ? 0 : technology.rating;
        technology.condition_monitor.max = 8 + Math.ceil(rating / 2);
    },

    /**
     * Calculate a devices ability to conceal.
     * 
     * See SR5#419 'Concealing Gear'
     * @param technology The system technology section to be altered
     * @param equippedMods Those item mods that are equipped.
     */
    prepareConceal(technology: Shadowrun.TechnologyData, equippedMods: SR5Item[]) {
        // Calculate conceal data.
        if (!technology.conceal) technology.conceal = {base: 0, value: 0, mod: []};

        const concealParts = new PartsList<number>();
        equippedMods.forEach((mod) => {
            if (mod.system.conceal  && mod.system.conceal > 0) {
                concealParts.addUniquePart(mod.name as string, mod.system.conceal);
            }
        });

        technology.conceal.mod = concealParts.list;
        technology.conceal.value = Helpers.calcTotal(technology.conceal);
    },

    /**
     * Calculate availability values.
     * 
     * @param item The item for additional data
     * @param technology The system technology section to be altered
     */
    prepareAvailability(item: SR5Item, technology: Shadowrun.TechnologyData) {
        const availability = String(technology.availability ?? 0);

        const {adjusted, value} = ItemAvailabilityFlow.prepareAvailabilityValue(availability, technology.calculated.availability.adjusted, item.getRating());

        technology.calculated.availability.adjusted = adjusted;
        technology.calculated.availability.value = value;
    },

    /**
     * Calculate cost values.
     * 
     * @param item The item for additional data
     * @param technology The system technology section to be altered
     */
    prepareCost(item: SR5Item, technology: Shadowrun.TechnologyData) {
        const baseCost = Number(technology.cost ?? 0);
        const rating = item.getRating();

        const actualCost = technology.calculated.cost.adjusted ? baseCost * rating : baseCost;
        technology.calculated.cost.value = actualCost
    },

}