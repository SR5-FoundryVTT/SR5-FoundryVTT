import { SR5Actor } from "../actor/SR5Actor";
import { PartsList } from "../parts/PartsList";
import { MatrixRules } from "../rules/MatrixRules";
import { SuccessTest, SuccessTestData } from "./SuccessTest";

export interface BruteForceData extends SuccessTestData {
    // Amount of marks to be placed
    marks: number
    // If decker and target reside on different Grids
    sameGrid: boolean
    // If decker has a direct connection to the target
    directConnection: boolean
}

/**
 * Brute force tests implement the Brute Force action on SR5#238
 */
export class BruteForceTest extends SuccessTest<BruteForceData> {
        override actor: SR5Actor;

        override _prepareData(data: BruteForceData, options): any {
            data = super._prepareData(data, options);
            
            // Place a single mark as default
            data.marks = data.marks ?? 1;
            // Assume decker and target reside on the same Grid
            data.sameGrid = data.sameGrid ?? true;
            // Assume no direct connection
            data.directConnection = data.directConnection ?? false;
    
            return data;
        }
    
        /**
         * Brute Force is a matrix action.
         */
        override get testCategories(): Shadowrun.ActionCategories[] {
            return ['matrix', 'brute_force'];
        }
        
        /**
         * Any matrix action gets the noise modifier.
         */
        override get testModifiers(): Shadowrun.ModifierTypes[] {
            const modifiers = super.testModifiers;
            modifiers.push('noise');
            return modifiers;
        }
        
        override get _dialogTemplate(): string {
            return 'systems/shadowrun5e/dist/templates/apps/dialogs/brute-force-test-dialog.html';
        }

        /**
         * Base on test dialog selection, different modifiers apply.
         */
        override prepareTestModifiers() {
            super.prepareTestModifiers();

            const modifiers = new PartsList<number>(this.data.modifiers.mod);

            // Apply mark modifier
            modifiers.addUniquePart('SR5.ModifierTypes.Marks', MatrixRules.getMarkPlacementModifier(this.data.marks));

            // Check for grid modifiers.
            if (!this.data.sameGrid) {
                // TODO: move this into matrix rules?
                modifiers.addUniquePart('SR5.ModifierTypes.DifferentGrid', MatrixRules.differentGridModifier());
            } else {
                modifiers.addUniquePart('SR5.ModifierTypes.DifferentGrid', 0);
            }

            // Check for direct connection modifiers.
            if (this.data.directConnection) {
                // Grid modifiers don't apply when directly connected.
                modifiers.addUniquePart('SR5.ModifierTypes.DifferentGrid', 0);
                modifiers.addUniquePart('SR5.ModifierTypes.Noise', 0);
            } else {
                modifiers.addUniquePart('SR5.ModifierTypes.Noise', this.actor.modifiers.totalFor('noise'));
            }
        }

        override validateBaseValues() {
            super.validateBaseValues();

            // Assure user is not entering broken data.
            this.data.marks = MatrixRules.getValidMarksPlacementCount(this.data.marks);
        }
}
