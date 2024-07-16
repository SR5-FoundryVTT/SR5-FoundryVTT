import { PartsList } from '../../parts/PartsList';
import { MatrixRules } from '../../rules/MatrixRules';
import { HackOnTheFlyTest } from '../HackOnTheFlyTest';
import { OpposedTestData } from '../OpposedTest';
import { SuccessTestData, TestOptions } from '../SuccessTest';
import { BruteForceTest } from './../BruteForceTest';

export interface MatrixPlacementData extends SuccessTestData {
    // Amount of marks to be placed
    marks: number
    // If decker and target reside on different Grids
    sameGrid: boolean
    // If decker has a direct connection to the target
    directConnection: boolean
    // The persona uuid. This would be the user main persona icon, not necessarily the device.
    personaUuid: string
    // The icon uuid. This would be the actual mark placement target. Can be a device, a persona device, a host or actor.
    iconUuid: string
    // Should the mark be placed on the main icon / persona or icons connected to it?
    placeOnMainIcon: boolean
}

export interface OpposeMarkPlacementData extends OpposedTestData {
    against: MatrixPlacementData
    personaUuid: string
    iconUuid: string
}
/**
 * Handle test flows for placing marks between different tests / actions.
 */
export const MarkPlacementFlow = {
    /**
     * Prepare data for the initial mark placement test.
     * 
     * @param data 
     * @param options 
     * @returns 
     */
    _prepareData(data: MatrixPlacementData, options: TestOptions): any {
        // Place a single mark as default
        data.marks = data.marks ?? 1;
        // Assume decker and target reside on the same Grid
        data.sameGrid = data.sameGrid ?? true;
        // Assume no direct connection
        data.directConnection = data.directConnection ?? false;
        data.personaUuid = data.personaUuid ?? undefined;
        data.iconUuid = data.iconUuid ?? undefined;
        // By default a decker can place marks either on the main icon or its connected icon.
        // This can be a persona or device relationship or a host and its devices.
        data.placeOnMainIcon = data.placeOnMainIcon ?? true;

        return data;
    },

    /**
     * Prepare data for the opposing mark placement test.
     * @param data 
     * @param options 
     * @returns 
     */
    _prepareOpposedData(data: OpposeMarkPlacementData, options: TestOptions): any {
        data.personaUuid = data.personaUuid ?? data.against.personaUuid;
        data.iconUuid = data.iconUuid ?? data.against.iconUuid;
        return data;
    },

    /**
     * Prepare all test modifiers for the mark placement test based on user selection.
     * 
     * @param test The initial test to modify.
     */
    prepareTestModifiers(test: BruteForceTest|HackOnTheFlyTest) {

        const modifiers = new PartsList<number>(test.data.modifiers.mod);

        // Apply mark modifier
        modifiers.addUniquePart('SR5.ModifierTypes.Marks', MatrixRules.getMarkPlacementModifier(test.data.marks));

        // Check for grid modifiers.
        if (!test.data.sameGrid) {
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

    /**
     * Validate all base values for the mark placement test.
     * 
     * @param test The initial test to validate.
     */
    validateBaseValues(test: BruteForceTest|HackOnTheFlyTest) {
        test.data.marks = MatrixRules.getValidMarksPlacementCount(test.data.marks);
    }
}