/**
 * Adept power item data preparation
 */

export const AdeptPowerPrep = {
    prepareBaseData(system: Shadowrun.AdeptPowerData) {
        AdeptPowerPrep.prepareType(system);
    },
    /**
     * Determine Adept Power Type based on action type.
     * @param action 
     */
    prepareType(system: Shadowrun.AdeptPowerData) {
        system.type = system.action.type ? 'active' : 'passive';
    }
}