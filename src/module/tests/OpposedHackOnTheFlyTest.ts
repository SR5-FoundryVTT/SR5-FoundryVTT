import { Translation } from "../utils/strings";
import { MarkPlacementFlow } from "./flows/MarkPlacementFlow";
import { HackOnTheFlyTest } from "./HackOnTheFlyTest";
import { OpposedMatrixTest } from '@/module/tests/OpposedMatrixTest';

/**
 * Implement the opposing test for Hack on the Fly action. See SR5#240 'Hack On The Fly'
 */
export class OpposedHackOnTheFlyTest extends OpposedMatrixTest {
    declare against: HackOnTheFlyTest;

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/opposing-mark-test-dialog.hbs';
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/opposing-mark-test-message.hbs';
    }

    override get successLabel(): Translation {
        return "SR5.TestResults.HackOnTheFlyFailure";
    }

    override get failureLabel(): Translation {
        return "SR5.TestResults.HackOnTheFlySuccess";
    }

    override prepareBaseValues() {
        super.prepareBaseValues();
        MarkPlacementFlow.prepareGridDefensePool(this);
    }

    /**
     * When failing against hack on the fly, the decker gets a mark on the target.
     */
    override async processFailure() {
        if (!this.icon || !this.against.actor) {
            console.error('Shadowrun 5e | Expected an active decker or icon', this.against.actor, this.icon);
            return;
        }

        // Place a mark on the target
        const marks = this.against.data.marks;
        await this.against.actor.setMarks(this.icon, marks);
    }
}
