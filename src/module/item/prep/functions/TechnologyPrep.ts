import { SR5 } from "@/module/config";
import { SR5Item } from "../../SR5Item";
import { ModifiableValue } from "../../../mods/ModifiableValue";
import { DataDefaults } from "@/module/data/DataDefaults";
import { TechnologyType } from "src/module/types/template/Technology";
import { ModifiableValueType } from "@/module/types/template/Base";
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
        const concealParts = new ModifiableValue(technology.conceal);
        for (const mod of equippedMods)
            concealParts.setUnique(mod.name, mod.system.mod_weapon.conceal);

        concealParts.calcTotal();
    },

    /**
     * All technology items use their device rating for mental attributes by default.
     * See SR5#237 'Matrix Actions'.
     * 
     * These mental attributes might later be overwritten within SR5Item.getTestData.
     * 
     */
    prepareMentalAttributes(system: SR5Item['system']) {
        const attributes = system.attributes!;
        const technology = system.technology!;

        for (const name of SR5.mentalAttributes) {
            // Rating can be undefined...
            const rating = technology.rating ?? 0;
            // Rating can be a string...
            const base = Number(rating);
            const label = SR5.attributes[name];

            const attribute = DataDefaults.createData('attribute_field', { label, base });
            attributes[name] = attribute;
        }
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
        const parts = new ModifiableValue(attributes.rating);
        parts.add('SR5.Host.Rating', rating);
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
     * Resolve availability from base + system parts, before item ActiveEffects apply natively on top.
     *
     * Out-of-place: system-provided parts (e.g. ware grade) are folded onto `.value` once and left in
     * `changes[]` as a display log. The final label/restriction is composed after effects by
     * {@link finalizeAvailability}.
     *
     * @param technology The system technology section to be altered
     */
    prepareAvailability(technology: TechnologyType) {
        TechnologyPrep.dropEffectSourcedChanges(technology.availability);
        ModifiableValue.applyChanges(technology.availability, undefined, { min: 0 });
    },

    /**
     * Compose the availability label and restriction from the post-effect `.value`.
     *
     * Runs after item ActiveEffects so an effect on the availability number or restriction is reflected
     * in the displayed label (e.g. 6R + 2 -> 8R).
     *
     * @param technology The system technology section to be altered
     */
    finalizeAvailability(technology: TechnologyType) {
        ItemAvailabilityFlow.finalizeLabel(technology.availability);
    },

    /**
     * Resolve cost from base + system parts, before item ActiveEffects apply natively on top.
     *
     * @param technology The system technology section to be altered
     */
    prepareCost(technology: TechnologyType) {
        TechnologyPrep.dropEffectSourcedChanges(technology.cost);
        ModifiableValue.applyChanges(technology.cost, undefined, { decimal: true });
    },

    /**
     * Remove display-log entries left by a previous prep's native ActiveEffect application.
     *
     * Item ModifiableValues are not reset between prepare cycles (unlike actor values), so prior native
     * effect entries would otherwise be re-folded as if they were system parts. System parts keep an empty
     * `source`; native effect entries carry the effect uuid.
     */
    dropEffectSourcedChanges(field: ModifiableValueType) {
        field.changes = field.changes.filter(change => !change.source);
    },
}
