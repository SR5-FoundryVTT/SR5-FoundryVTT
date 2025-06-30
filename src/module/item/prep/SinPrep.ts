/**
 * SIN item data preparation
 */
export const SinPrep = {
    prepareBaseData(system: Item.SystemOfType<'sin'>) {
        SinPrep.prepareLicenseData(system);
    },
    prepareLicenseData(system: Item.SystemOfType<'sin'>) {
        if (typeof system.licenses === 'object') {
            // taMiF: This seems to be a hacky solution to some internal or Foundry issue with reading
            //        a object/HashMap when an array/iterable was expected
            system.licenses = Object.values(system.licenses);
        }
    }
}
