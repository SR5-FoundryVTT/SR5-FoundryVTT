import HostData = Shadowrun.HostData;
import {MatrixRules} from "../../rules/MatrixRules";

export function HostDataPreparation(data: HostData) {
    HostPrep.setDeviceCategory(data);
    HostPrep.prepareMatrixAttributes(data);
}


export class HostPrep {
    static setDeviceCategory(data: HostData) {
        // Host matrix 'devices' are always hosts and never commlink / cyberdecks.
        data.category = 'host';
    }

    /**
     * Apply host matrix attribute rating.
     * @param data
     */
    static prepareMatrixAttributes(data: HostData) {
        const hostAttributeRatings = MatrixRules.hostMatrixAttributeRatings(data.rating);
        Object.values(data.atts).forEach(attribute => {
            attribute.value = hostAttributeRatings.pop();
            // Disallow editing on the item sheet, since the value is derived.
            attribute.editable = false;
        })
    }
}