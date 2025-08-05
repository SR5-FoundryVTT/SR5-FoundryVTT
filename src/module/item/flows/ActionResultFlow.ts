import { SR5Actor } from "../../actor/SR5Actor";
import { MatrixRules } from "../../rules/MatrixRules";
import { SuccessTest } from "../../tests/SuccessTest";
import { ResultActionType } from "src/module/types/item/Action";
import { PhysicalDefenseTest } from "../../tests/PhysicalDefenseTest";

type ResultActions = ResultActionType['action'];

type ActionResultOptions = {
    messageId: string
    // The original event tirggering this action result.
    event: Event
    // The original element taken from the event.
    element: JQuery<HTMLElement>
}

/**
 * Whenever any action or test implementation can cause a result that needs
 * to be manually applied, use this handler
 */
export class ActionResultFlow {
    /**
         * The handlers registered for specific result action.
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
     * @param context In what context has the result action been triggered
     */
    static async executeResult(resultAction: ResultActions, context: ActionResultOptions) {
        const handler = ActionResultFlow._handlersResultAction.get(resultAction);

        if (!handler)
            return console.error(`Shadowrun 5e | Action result ${resultAction} has not handler registered`);

        await handler(context);
    }

    /**
     * Modify the actors combatant according the test defined initiative modifier.
     * 
     * @param test The test instance causing the initiative modification
     */
    static async _castInitModifierAction(test: PhysicalDefenseTest) {
        if (!(test instanceof PhysicalDefenseTest)) return;
        
        if (!test.data.iniMod) return;
        await test.actor?.changeCombatInitiative(test.data.iniMod);
    }
}
