import { PartsList } from '../../parts/PartsList';
import { MatrixRules } from '../../rules/MatrixRules';
import { HackOnTheFlyTest } from '../HackOnTheFlyTest';
import { SuccessTestData } from '../SuccessTest';
import { BruteForceTest } from './../BruteForceTest';

export interface MatrixPlacementData extends SuccessTestData {
    // Amount of marks to be placed
    marks: number
    // If decker and target reside on different Grids
    sameGrid: boolean
    // If decker has a direct connection to the target
    directConnection: boolean
    // The uuid of the target actor / device / host.
    targetUuid?: string
    // Should the mark be placed on the main icon / persona or icons connected to it?
    placeOnMainIcon: boolean
}
/**
 * Handle test flows for placing marks between different tests / actions.
 */
export const MarkPlacementFlow = {
    _prepareData(data: MatrixPlacementData, options): any {
        // Place a single mark as default
        data.marks = data.marks ?? 1;
        // Assume decker and target reside on the same Grid
        data.sameGrid = data.sameGrid ?? true;
        // Assume no direct connection
        data.directConnection = data.directConnection ?? false;
        // A uuid for a matrix target (actor or item)
        data.targetUuid = data.targetUuid ?? undefined;
        // By default a decker can place marks either on the main icon or its connected icon.
        // This can be a persona or device relationship or a host and its devices.
        data.placeOnMainIcon = data.placeOnMainIcon ?? true;

        return data;
    },

    prepareTestModifiers(test: BruteForceTest|HackOnTheFlyTest) {

        const modifiers = new PartsList<number>(test.data.modifiers.mod);

        // Apply mark modifier
        modifiers.addUniquePart('SR5.ModifierTypes.Marks', MatrixRules.getMarkPlacementModifier(test.data.marks));

        // Check for grid modifiers.
        if (!test.data.sameGrid) {
            // TODO: move this into matrix rules?
            modifiers.addUniquePart('SR5.ModifierTypes.DifferentGrid', MatrixRules.differentGridModifier());
        } else {
            modifiers.addUniquePart('SR5.ModifierTypes.DifferentGrid', 0);
        }

        // Check for direct connection modifiers.
        if (test.data.directConnection) {
            // Grid modifiers don't apply when directly connected.
            modifiers.addUniquePart('SR5.ModifierTypes.DifferentGrid', 0);
            modifiers.addUniquePart('SR5.ModifierTypes.Noise', 0);
        } else {
            modifiers.addUniquePart('SR5.ModifierTypes.Noise', test.actor.modifiers.totalFor('noise'));
        }
    },

    validateBaseValues(test: BruteForceTest|HackOnTheFlyTest) {
        test.data.marks = MatrixRules.getValidMarksPlacementCount(test.data.marks);
    }
}