import { TestOptions } from './SuccessTest';
import { MarkPlacementFlow, MatrixPlacementData } from './flows/MarkPlacementFlow';
import { MatrixTest } from './MatrixTest';

/**
 * Brute force tests implement the Brute Force action on SR5#238
 * 
 * See MarkPlacementFlow for more details on the test flow.
 */
export class BruteForceTest extends MatrixTest<MatrixPlacementData> {
    override _prepareData(data: MatrixPlacementData, options: TestOptions = {}): any {
        data = super._prepareData(data, options);
        return MarkPlacementFlow._prepareData(data);
    }

    /**
     * Brute Force is a matrix action.
     */
    override get testCategories(): Shadowrun.ActionCategories[] {
        return ['matrix', 'brute_force'];
    }

    override get _dialogTemplate(): string {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/brute-force-test-dialog.html';
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/chat/matrix-test-message.hbs';
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
