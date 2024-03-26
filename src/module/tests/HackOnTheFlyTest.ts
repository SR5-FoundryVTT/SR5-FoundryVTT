import { SR5Actor } from "../actor/SR5Actor";
import { SuccessTest } from "./SuccessTest";
import { MarkPlacementFlow, MatrixPlacementData } from "./flows/MarkPlacementFlow";


/**
 * Hack on the Fly tests implement the Hack on the Fly action on SR5#240
 */
export class HackOnTheFlyTest extends SuccessTest<MatrixPlacementData> {
    override actor: SR5Actor;

    override _prepareData(data: MatrixPlacementData, options): any {
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
        return ['matrix', 'hack_on_the_fly'];
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

    override prepareTestModifiers() {
        super.prepareTestModifiers();

        MarkPlacementFlow.prepareTestModifiers(this);
    }

    override validateBaseValues() {
        super.validateBaseValues();

        MarkPlacementFlow.validateBaseValues(this);
    }
}