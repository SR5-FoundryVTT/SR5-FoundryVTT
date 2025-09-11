import { Translation } from "../utils/strings";
import { OpposedMatrixTest } from '@/module/tests/OpposedMatrixTest';
import { EraseMarkTest } from '@/module/tests/EraseMarkTest';

/**
 * Implement the opposing test for Erase Mark action. See SR5#239 'Erase Mark'
 */
export class OpposedEraseMarkTest extends OpposedMatrixTest {
    declare against: EraseMarkTest;

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/opposing-mark-test-dialog.hbs';
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/opposing-mark-test-message.hbs';
    }

    override get successLabel(): Translation {
        return "SR5.TestResults.EraseMarkFailure";
    }

    override get failureLabel(): Translation {
        return "SR5.TestResults.EraseMarkSuccess";
    }

    /**
     * When failing against erase mark, the decker erases a mark on their icon
     */
    override async processFailure() {
        if (!this.icon || !this.against.actor) {
            console.error('Shadowrun 5e | Expected an active decker or icon', this.against.actor, this.icon);
            return;
        }

        // Erase a mark on the target
        const marks = this.against.data.marks;
        await this.against.actor.setMarks(this.icon, -marks);
    }
}
