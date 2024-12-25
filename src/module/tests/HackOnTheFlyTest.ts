import { SR5Actor } from "../actor/SR5Actor";
import { SR5Item } from "../item/SR5Item";
import { SuccessTest } from "./SuccessTest";
import { MarkPlacementFlow, MatrixPlacementData } from "./flows/MarkPlacementFlow";

/**
 * Hack on the Fly tests implement the Hack on the Fly action on SR5#240
 *
 * See MarkPlacementFlow for more details on the test flow.
 */
export class HackOnTheFlyTest extends SuccessTest<MatrixPlacementData> {
    override actor: SR5Actor;

    // The icon to place a mark on.
    // If an actor was selected, this will point to either the persona device or the actor itself, if no persona device is used.
    icon: Shadowrun.NetworkDevice;
    // The persona matrix actor. If in use, icon will either point to the actor, if no persona device is used, or the persona device.
    persona: SR5Actor;
    // The devices connected to the main icon persona / host.
    devices: (Shadowrun.NetworkDevice)[];
    // Started ic on selected host.
    ic: SR5Actor[];
    // Host used as main icon.
    host: SR5Item|null;
    // Grid used as main icon.
    grid: SR5Item|null;

    override _prepareData(data: MatrixPlacementData, options): any {
        data = super._prepareData(data, options);
        return MarkPlacementFlow._prepareData(data);
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

    override get _chatMessageTemplate() {
        return 'systems/shadowrun5e/dist/templates/chat/matrix-test-message.hbs';
    }

    override prepareBaseValues() {
        MarkPlacementFlow.prepareBaseValues(this);
    }

    /**
     * Clean up faulty test data after dialog has been shown.
     */
    override async _cleanUpAfterDialog() {
        await super._cleanUpAfterDialog();
        MarkPlacementFlow.setIconUuidBasedOnPlacementSelection(this);
    }

    override async populateDocuments() {
        await super.populateDocuments();
        MarkPlacementFlow.populateDocuments(this);
    }

    override prepareTestModifiers() {
        super.prepareTestModifiers();

        MarkPlacementFlow.prepareTestModifiers(this);
    }

    override validateBaseValues() {
        super.validateBaseValues();

        MarkPlacementFlow.validateBaseValues(this);
    }

    override async addTarget(document: SR5Actor | SR5Item) {
        await MarkPlacementFlow.addTarget(this, document);
    }
}