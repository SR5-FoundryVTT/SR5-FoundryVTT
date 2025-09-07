import { PartsList } from '../../parts/PartsList';
import { MatrixRules } from '../../rules/MatrixRules';
import { HackOnTheFlyTest } from '../HackOnTheFlyTest';
import { MatrixTestData } from '../MatrixTest';
import { OpposedBruteForceTest } from '../OpposedBruteForceTest';
import { OpposedHackOnTheFlyTest } from '../OpposedHackOnTheFlyTest';
import { BruteForceTest } from './../BruteForceTest';
import { MatrixTestDataFlow } from './MatrixTestDataFlow';

export interface MatrixPlacementData extends MatrixTestData {
    // Amount of marks to be placed
    marks: number
}

type MarkPlacementTests = BruteForceTest | HackOnTheFlyTest;
type MarkPlacementDefenseTest = OpposedBruteForceTest | OpposedHackOnTheFlyTest;
/**
 * Handle test flows for placing marks between different tests / actions.
 * 
 * This assumes that:
 * - A persona will be selected BEFORE testing starts and won't be changeable during.
 */
export const MarkPlacementFlow = {
    /**
     * Prepare data for the initial mark placement test.
     * 
     * @param data 
     * @param options 
     * @returns 
     */
    _prepareData(data: MatrixPlacementData): any {
        MatrixTestDataFlow._prepareData(data);
        // Place a single mark as default
        data.marks = data.marks ?? 1;

        return data;
    },

    /**
     * Prepare all test modifiers for the mark placement test based on user selection.
     * 
     * @param test The initial test to modify.
     */
    prepareTestModifiers(test: MarkPlacementTests) {

        const modifiers = new PartsList<number>(test.data.modifiers.mod);

        // Apply mark modifier
        modifiers.addUniquePart('SR5.ModifierTypes.Marks', MarkPlacementFlow.getMarkPlacementModifier(test));

        MatrixTestDataFlow.prepareTestModifiers(test);
    },

    /**
     * Validate all base values for the mark placement test.
     * 
     * @param test The initial test to validate.
     */
    validateBaseValues(test: MarkPlacementTests) {
        test.data.marks = MatrixRules.getValidMarksPlacementCount(test.data.marks);
    },

    /**
     * Grid networks have special pool calculation based on rules.
     */
    prepareGridDefensePool(test: MarkPlacementDefenseTest) {
        if (!test.device?.isType('grid')) return;
        const modifier = MatrixRules.gridMarkPlacementDefensePool(test.device);
        if (!modifier) return;
        test.pool.mod.push(modifier);
    },

    /**
     * Get the correct modifier depending on the marks placed.
     * 
     * This can depend on local actor values or a default value.
     */
    getMarkPlacementModifier(test: MarkPlacementTests) {
        const modifier = MatrixRules.getMarkPlacementModifier(test.data.marks);

        // Allow users to modify the mark placement modifier through effects.
        switch (test.data.marks) {
            case 2: return modifier + (test.actor?.modifiers.totalFor('place_two_marks') ?? 0);
            case 3: return modifier + (test.actor?.modifiers.totalFor('place_three_marks') ?? 0);
        }

        return modifier;
    }
}
