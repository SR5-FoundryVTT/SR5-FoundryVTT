import { PhysicalDefenseTestData } from './../../tests/PhysicalDefenseTest';
import {SuccessTest} from "../../tests/SuccessTest";
import ResultActions = Shadowrun.ResultActions;


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
    static get _handlersResultAction(): Map<ResultActions, ((test: SuccessTest) => Promise<void>)> {
        const handlers = new Map();
        handlers.set('modifyCombatantInit', ActionResultFlow._castInitModifierAction.bind(this));

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
     * Modify the actors combatant according the test defined initiative modifier.
     * 
     * @param test The test instance causing the initiative modification
     */
    static async _castInitModifierAction(test: SuccessTest) {
        // NOTE: Use test data typing here, as including PhysicalDefenseTest would cause circular dependencies, breaking SuccessTest/OpposedTest import order.
        const data = test.data as PhysicalDefenseTestData;
        if (!data.iniMod) return;
        await test.actor?.changeCombatInitiative(data.iniMod);
    }
}