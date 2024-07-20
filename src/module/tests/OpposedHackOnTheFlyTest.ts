import { SR5Actor } from "../actor/SR5Actor";
import { NetworkDevice } from "../item/flows/MatrixNetworkFlow";
import { Translation } from "../utils/strings";
import { MarkPlacementFlow, MatrixPlacementData } from "./flows/MarkPlacementFlow";
import { HackOnTheFlyTest } from "./HackOnTheFlyTest";
import { OpposedTest } from "./OpposedTest";
import { TestOptions } from "./SuccessTest";

/**
 * Implement the opposing test for Hack on the Fly action. See SR5#240 'Hack On The Fly'
 */
export class OpposedHackOnTheFlyTest extends OpposedTest {
    override against: HackOnTheFlyTest;
    icon: NetworkDevice
    persona: SR5Actor;

    override _prepareData(data: any, options?: TestOptions) {
        data = super._prepareData(data, options);
        return MarkPlacementFlow._prepareOpposedData(data);
    }

    override get _dialogTemplate() {
        return 'systems/shadowrun5e/dist/templates/apps/dialogs/opposing-mark-test-dialog.html';
    }

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/rolls/opposing-mark-test-message.html';
    }

    override get successLabel(): Translation {
        return "SR5.TestResults.HackOnTheFlyFailure";
    }

    override get failureLabel(): Translation {
        return "SR5.TestResults.HackOnTheFlySuccess";
    }

    override async populateDocuments() {
        MarkPlacementFlow.populateOpposedDocuments(this);
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

    static override async executeMessageAction(againstData: MatrixPlacementData, messageId: string, options: TestOptions): Promise<void> {
        await MarkPlacementFlow.executeMessageAction(this, againstData, messageId, options);
    }
}