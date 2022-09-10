import HostData = Shadowrun.HostData;
import {MatrixRules} from "../../rules/MatrixRules";

export function HostDataPreparation(system: HostData) {
    HostPrep.setDeviceCategory(system);
    HostPrep.prepareMatrixAttributes(system);
}


export class HostPrep {
    static setDeviceCategory(system: HostData) {
        // Host matrix 'devices' are always hosts and never commlink / cyberdecks.
        system.category = 'host';
    }

    /**
     * Apply host matrix attribute rating.
     * @param system
     */
    static prepareMatrixAttributes(system: HostData) {
        const hostAttributeRatings = MatrixRules.hostMatrixAttributeRatings(system.rating);
        Object.values(system.atts).forEach(attribute => {
            attribute.value = hostAttributeRatings.pop();
            // Disallow editing on the item sheet, since the value is derived.
            attribute.editable = false;
        })
    }
}