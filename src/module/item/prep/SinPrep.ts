/**
 * SIN item data preparation
 */
export const SinPrep = {
    prepareBaseData(system: Shadowrun.SinData) {
        SinPrep.prepareLicenseData(system);
    },
    prepareLicenseData(system: Shadowrun.SinData) {
        if (typeof system.licenses === 'object') {
            // taMiF: This seems to be a hacky solution to some internal or Foundry issue with reading
            //        a object/HashMap when an array/iterable was expected
            system.licenses = Object.values(system.licenses);
        }
    }
}