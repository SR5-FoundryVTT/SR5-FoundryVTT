import {MatrixRules} from "../../rules/MatrixRules";

export function HostDataPreparation(system: Item.SystemOfType<'host'>) {
    HostPrep.setDeviceCategory(system);
    HostPrep.prepareMatrixAttributes(system);
}


export class HostPrep {
    static setDeviceCategory(system: Item.SystemOfType<'host'>) {
        // Host matrix 'devices' are always hosts and never commlink / cyberdecks.
        // system.category = 'host';
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
        const { customAttributes } = system;

        const hostAttributeRatings = MatrixRules.hostMatrixAttributeRatings(system.rating);
        Object.values(system.atts).forEach(attribute => {
            attribute.value = customAttributes ? attribute.value : hostAttributeRatings.pop()!;
            attribute.editable = customAttributes;
        })
    }
}
