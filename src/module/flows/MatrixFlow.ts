/**
 * General handling around handling everything matrix related.
 */
export const MatrixFlow = {
    /**
     * Switch out one matrix attribute with a new one.
     * 
     * NOTE: attributes given are changed in place.
     * 
     * @param matrixAttributes The attribute data.
     * @param changedSlot The attribute slot changed
     * @param attribute The attribute selected to change into the changed slot.
     * 
     * @returns Changed matrix attributes data.
     */
    changeMatrixAttribute(matrixAttributes: Shadowrun.MatrixAttributes, changedSlot: string, attribute: Shadowrun.MatrixAttribute): Record<string, any> {
        // The attribute that used to be in the slot that's changing.
        const previousAttribute = matrixAttributes[changedSlot].att;
        // The slot of the selected attribute that will get the previous attribute.
        let previousSlot = '';
        Object.entries(matrixAttributes).forEach(([slot, {att}]) => {
            if (att === attribute) {
                previousSlot = slot;
            }
        });

        if (!previousSlot) {
            console.error(`Shadowrun 5e | Couldn't change attribute ${attribute} as it wasn't found in matrix attribute slots`, matrixAttributes);
            return {};
        }

        const updateData = {
            [`system.atts.${changedSlot}.att`]: attribute,
            [`system.atts.${previousSlot}.att`]: previousAttribute
        };

        return updateData;
    }
}