import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { Translation } from "../utils/strings";
import { MatrixPlacementData } from "./flows/MarkPlacementFlow";
import { MatrixTestDataFlow } from "./flows/MatrixTestDataFlow";
import { HackOnTheFlyTest } from "./HackOnTheFlyTest";
import { OpposedMatrixTestData } from "./MatrixTest";
import { OpposedTest } from "./OpposedTest";
import { TestOptions } from "./SuccessTest";

/**
 * Implement the opposing test for Hack on the Fly action. See SR5#240 'Hack On The Fly'
 */
export class OpposedHackOnTheFlyTest extends OpposedTest<OpposedMatrixTestData> {
    declare against: HackOnTheFlyTest;
    declare icon: SR5Actor | SR5Item;
    declare device: SR5Item;
    declare persona: SR5Actor;

    override _prepareData(data: any, options?: TestOptions) {
        data = super._prepareData(data, options);
        return MatrixTestDataFlow._prepareOpposedData(data);
    }

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

    override async populateDocuments() {
        await MatrixTestDataFlow.populateOpposedDocuments(this);
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
        await MatrixTestDataFlow.executeMessageAction(this, againstData, messageId, options);
    }
}
