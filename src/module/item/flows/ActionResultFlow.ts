import {MatrixRules} from "../../rules/MatrixRules";
import {SR5Actor} from "../../actor/SR5Actor";
import {SR5Item} from "../SR5Item";

export class ActionResultFlow {
    /**
     * Matrix Marks are placed on either actors (persona, ic) or items (device, host, technology).
     */
    static async placeMatrixMarks(active: SR5Actor, targets: Token[], marks: number) {
        if (!MatrixRules.isValidMarksCount(marks)) {
            return ui.notifications.warn(game.i18n.localize("SR5.Warnings.InvalidMarksCount"));
        }

        for (const target of targets) {
            await active.setMarks(target, marks);
        }
    }
}