import { SR5 } from "../../config";
import { MatrixRules } from "../../rules/MatrixRules";
import { DataDefaults } from "../../data/DataDefaults";
import { TechnologyPrep } from "./functions/TechnologyPrep";

export class HostPrep {
    static prepareBaseData(system: Item.SystemOfType<'host'>) {
        HostPrep.setDeviceCategory(system);
        HostPrep.prepareMatrixAttributes(system);
        HostPrep.prepareMentalAttributes(system);
        HostPrep.prepareRatingAttribute(system);
    }

    /**
     * Prepare derived data, including calculation
     * @param system 
     */
    static prepareDerivedData(system: Item.SystemOfType<'host'>) {
        TechnologyPrep.calculateAttributes(system.attributes);
    }

    static setDeviceCategory(system: Item.SystemOfType<'host'>) {
        // Host matrix 'devices' are always hosts and never commlink / cyberdecks.
        system.category = 'host';
    }

    /**
     * Apply host matrix attribute rating.
     * 
     * Allow for custom attribute selections by user circumventing the rules.
     * 
     * This also allows for Kill Code#42 alternative host attribute values.
     * 
     * @param system
     */
    static prepareMatrixAttributes(system: Item.SystemOfType<'host'>) {
        const { customAttributes, attributes } = system;

        const hostAttributeRatings = MatrixRules.hostMatrixAttributeRatings(system.rating);
        Object.values(system.atts).forEach(matrixAttr => {
            // Prepare host matrix attribute.
            matrixAttr.value = customAttributes ? matrixAttr.value : hostAttributeRatings.pop()!;
            matrixAttr.editable = customAttributes;

            // Prepare item attribute for roll data.
            const label = SR5.attributes[matrixAttr.att];
            const base = matrixAttr.value;
            const attribute = DataDefaults.createData('attribute_field', { label, base });
            attributes[matrixAttr.att] = attribute;
        })
    }

    /**
     * Apply host rating to mental attributes.
     * 
     * TODO: Reference for host rating used as mental attribute
     * @param system 
     */
    static prepareMentalAttributes(system: Item.SystemOfType<'host'>) {

        for (const name of SR5.mentalAttributes) {
            const base = system.rating;
            const label = SR5.attributes[name]

            const attribute = DataDefaults.createData('attribute_field', { label, base });
            system.attributes[name] = attribute;
        }
    }

    /**
     * Allow hosts using their rating as a derived attribute.
     * @param system 
     */
    static prepareRatingAttribute(system: Item.SystemOfType<'host'>) {
        const base = system.rating;
        const label = SR5.attributes.rating;
        const attribute = DataDefaults.createData('attribute_field', { label, base });
        system.attributes.rating = attribute;
    }
}
