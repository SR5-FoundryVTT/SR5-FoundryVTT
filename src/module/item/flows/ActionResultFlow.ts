import {MatrixRules} from "../../rules/MatrixRules";
import {SR5Actor} from "../../actor/SR5Actor";
import {SuccessTest} from "../../tests/SuccessTest";

export class ActionResultFlow {
    /**
     * Handle execution of any action result action. :)
     *
     * NOTE: This is a horrible system and likely to be replaced someday...
     *
     * @param resultAction The action descriptor based on SuccessTest#_prepareResultActionsTemplateData.
     * @param test The SuccessTest subclass the action has been emitted from.
     */
    static async executeResult(resultAction: string, test: SuccessTest) {
        switch (resultAction) {
            case 'placeMarks': {
                ui.notifications?.error('Placing marks currently isnt suported. Sorry!');
                break;
            }
        }
    }
    /**
     * Matrix Marks are placed on either actors (persona, ic) or items (device, host, technology).
     */
    static async placeMatrixMarks(active: SR5Actor, targets: Token[], marks: number) {
        if (!MatrixRules.isValidMarksCount(marks)) {
            return ui.notifications?.warn(game.i18n.localize("SR5.Warnings.InvalidMarksCount"));
        }

        for (const target of targets) {
            await active.setMarks(target, marks);
        }
    }
}