/**
 * Adept power item data preparation
 */

export const AdeptPowerPrep = {
    prepareBaseData(system: Item.SystemOfType<'adept_power'>) {
        AdeptPowerPrep.prepareType(system);
    },
    /**
     * Determine Adept Power Type based on action type.
     * @param action 
     */
    prepareType(system: Item.SystemOfType<'adept_power'>) {
        system.type = system.action.type ? 'active' : 'passive';
    }
}
