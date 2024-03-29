import { SR5 } from "../../../config";
import { Helpers } from "../../../helpers";
import { PartsList } from "../../../parts/PartsList";
import { SR5Item } from "../../SR5Item";
import { DataDefaults } from '../../../data/DataDefaults';
import { AttributesPrep } from "../../../actor/prep/functions/AttributesPrep";

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
     * Assure that attributes are prepared for later derived data calculation of them.
     * 
     * @param system 
     */
    prepareAttributes(system: Shadowrun.ShadowrunTechnologyItemDataData) {
        system.attributes = {}
        system.attributes['rating'] = DataDefaults.attributeData({label: 'SR5.Rating'});
    },

    /**
     * All technology items use their device rating for mental attributes by default.
     * See SR5#237 'Matrix Actions'.
     * 
     * These mental attributes might later be overwritten within SR5Item.getTestData.
     * 
     */
    prepareMentalAttributes(system: Shadowrun.ShadowrunTechnologyItemDataData) {
        const { attributes, technology } = system;
        for (const name of SR5.mentalAttributes) {
            // Rating can be undefined...
            const rating = technology.rating ?? 0;
            // Rating can be a string...
            const base = Number(rating);
            const label = SR5.attributes[name];

            const attribute = DataDefaults.attributeData({ label, base });
            attributes[name] = attribute;
        }
    },

    /**
     * All technology items use their device rating for their matrix attributes by default.
     * See SR5#234 'Devices'.
     */
    prepareMatrixAttributes(system: Shadowrun.ShadowrunTechnologyItemDataData) {
        const { attributes, technology } = system;
        const attributesWithRating = ['data_processing', 'firewall'];

        for (const name of Object.keys(SR5.matrixAttributes)) {
            // Rating can be undefined...
            const rating = attributesWithRating.includes(name) ? technology.rating ?? 0 : 0;
            // Rating can be a string...
            const base = Number(rating);
            const label = SR5.attributes[name];

            const attribute = DataDefaults.attributeData({ label, base });
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
    calculateAttributes: (attributes: Shadowrun.AttributesData) => {
        for (const [name, attribute] of Object.entries(attributes)) {
            AttributesPrep.calculateAttribute(name, attribute);
        }
    }
}