import { Translation } from "../utils/strings";
import { HackOnTheFlyTest } from "./HackOnTheFlyTest";
import { OpposedTest } from "./OpposedTest";

/**
 * Implement the opposing test for Hack on the Fly action. See SR5#240 'Hack On The Fly'
 */
export class OpposedHackOnTheFlyTest extends OpposedTest {
    override against: HackOnTheFlyTest;
    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/opposing-mark-test-message.html';
    }

    override get successLabel(): Translation {
        return "SR5.TestResults.HackOnTheFlyFailure";
    }

    override get failureLabel(): Translation {
        return "SR5.TestResults.HackOnTheFlySuccess";
    }

    /**
     * When failing against hack on the fly, the decker gets a mark on the target.
     */
    override async processFailure() {
        if (!this.actor || !this.against.actor) return;

        // Place a mark on the target
        const marks = this.against.data.marks;
        await this.against.actor.setMarks(this.actor, marks);
    }
}