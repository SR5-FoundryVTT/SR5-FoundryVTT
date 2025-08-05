import { SR5 } from "@/module/config";
import { SR5Item } from "../../SR5Item";
import { Helpers } from "../../../helpers";
import { PartsList } from "../../../parts/PartsList";
import { ItemCostFlow } from "../../flows/ItemCostFlow";
import { DataDefaults } from "@/module/data/DataDefaults";
import { TechnologyType } from "src/module/types/template/Technology";
import { ItemAvailabilityFlow } from "../../flows/ItemAvailabilityFlow";
import { AttributesPrep } from "@/module/actor/prep/functions/AttributesPrep";
import { TechnologyAttributesType } from "@/module/types/template/Attributes";

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
    prepareConditionMonitor(technology: TechnologyType) {        
        const rating = technology.rating;
        technology.condition_monitor.max = 8 + Math.ceil(rating / 2);
    },

    /**
     * Calculate a devices ability to conceal.
     * 
     * See SR5#419 'Concealing Gear'
     * @param technology The system technology section to be altered
     * @param equippedMods Those item mods that are equipped.
     */
    prepareConceal(technology: TechnologyType, equippedMods: SR5Item<'modification'>[]) {
        const concealParts = new PartsList<number>();
        for (const mod of equippedMods)
            if (mod.system.conceal > 0)
                concealParts.addUniquePart(mod.name, mod.system.conceal);

        technology.conceal.mod = concealParts.list;
        technology.conceal.value = Helpers.calcTotal(technology.conceal);
    },

    /**
     * All technology items use their device rating for their matrix attributes by default.
     * See SR5#234 'Devices'.
     */
    prepareMatrixAttributes(system: SR5Item['system']) {
        const attributes = system.attributes!;
        const technology = system.technology!;
        const attributesWithRating = ['data_processing', 'firewall'];

        for (const name of Object.keys(SR5.matrixAttributes)) {
            // Rating can be undefined...
            const rating = attributesWithRating.includes(name) ? technology.rating ?? 0 : 0;
            // Rating can be a string...
            const base = Number(rating);
            const label = SR5.attributes[name];

            const attribute = DataDefaults.createData('attribute_field', { label, base });
            attributes[name] = attribute;
        }

        // Add device rating as attribute to allow for rolls with it.
        const rating = Number(technology.rating ?? 0);
        const parts = new PartsList(attributes.rating.mod);
        parts.addPart('SR5.Host.Rating', rating);
    },

    /**
     * Calculate device attributes.
     * @param attributes 
     */
    calculateAttributes: (attributes: TechnologyAttributesType) => {
        for (const [name, attribute] of Object.entries(attributes)) {
            AttributesPrep.calculateAttribute(name, attribute);
        }
    },

    /**
     * Calculate availability values.
     * 
     * @param item The item for additional data
     * @param technology The system technology section to be altered
     */
    prepareAvailability(item: SR5Item, technology: TechnologyType) {
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
    prepareCost(item: SR5Item, technology: TechnologyType) {
        const baseCost = Number(technology.cost ?? 0);
        const rating = item.getRating();

        const { value } = ItemCostFlow.prepareCostValue(baseCost, technology.calculated.cost.adjusted, rating);

        technology.calculated.cost.value = value;
    },

}