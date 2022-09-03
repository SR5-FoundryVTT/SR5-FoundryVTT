import {MatrixRules} from "../../rules/MatrixRules";
import {SR5Actor} from "../../actor/SR5Actor";
import {SuccessTest} from "../../tests/SuccessTest";
import { PhysicalDefenseTest } from "../../tests/PhysicalDefenseTest";
import ResultActions = Shadowrun.ResultActions;


/**
 * Whenever any action or test implementation can cause a result that needs
 * to be manually applied, use this handler
 */
export class ActionResultFlow {
    /**
         * The handleres registered for specific result action.
         * 
         * @returns A Map mapping action name to function handler
         */
    static get _handlersResultAction(): Map<ResultActions, Function> {
        const handlers = new Map();
        handlers.set('placeMarks', () => ui.notifications?.error('Placing marks currently isnt suported. Sorry!'));
        handlers.set('modifyCombatantInit', ActionResultFlow._castInitModifierAction);

        return handlers;
    }

    /**
     * Handle execution of any action result action. :)
     *
     * NOTE: This is a horrible system and likely to be replaced someday...
     *
     * @param resultAction The action descriptor based on SuccessTest#_prepareResultActionsTemplateData.
     * @param test The SuccessTest subclass the action has been emitted from.
     */
    static async executeResult(resultAction: ResultActions, test: SuccessTest) {
        const handler = ActionResultFlow._handlersResultAction.get(resultAction);

        if (!handler) 
            return console.error(`Shadowrun 5e | Action result ${resultAction} has not handler registered`);

        await handler(test);

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

    /**
     * Modify the actors combatant according the test defined initiative modifier.
     * 
     * @param test The test instance causing the initiave modification
     */
     static async _castInitModifierAction(test: PhysicalDefenseTest) {
        if (!(test instanceof PhysicalDefenseTest)) return;
        
        if (!test.data.iniMod) return;
        await test.actor?.changeCombatInitiative(test.data.iniMod);
    }
}