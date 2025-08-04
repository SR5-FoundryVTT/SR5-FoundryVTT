import { SR5Actor } from "../actor/SR5Actor";
import { MatrixTest } from "./MatrixTest";
import { MarkPlacementFlow, MatrixPlacementData } from "./flows/MarkPlacementFlow";

/**
 * Hack on the Fly tests implement the Hack on the Fly action on SR5#240
 *
 * See MarkPlacementFlow for more details on the test flow.
 */
export class HackOnTheFlyTest extends MatrixTest<MatrixPlacementData> {
    declare actor: SR5Actor;

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

    override prepareTestModifiers() {
        super.prepareTestModifiers();

        MarkPlacementFlow.prepareTestModifiers(this);
    }

    override validateBaseValues() {
        super.validateBaseValues();

        MarkPlacementFlow.validateBaseValues(this);
    }
}
