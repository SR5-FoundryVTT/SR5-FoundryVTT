import { ResultActionType } from "src/module/types/item/Action";
import { PhysicalDefenseTestData } from "../../tests/PhysicalDefenseTest";
import { TestCreator } from "@/module/tests/TestCreator";
import { Helpers } from "@/module/helpers";

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
    static get _handlersResultAction(): Map<ResultActions, ((context: ActionResultOptions) => Promise<void>)> {
        const handlers = new Map();
        handlers.set('modifyCombatantInit', ActionResultFlow._castInitModifierAction.bind(this));
        handlers.set('forceReboot', ActionResultFlow._onForceReboot.bind(this));

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
     */
    static async _castInitModifierAction(context: ActionResultOptions) {
        const test = await TestCreator.fromMessage(context.messageId);
        if (!test) return;

        await test.populateDocuments();
        // NOTE: Use test data typing here, as including PhysicalDefenseTest would cause circular dependencies, breaking SuccessTest/OpposedTest import order.
        const data = test.data as PhysicalDefenseTestData;
        if (!data.iniMod) return;
        await test.actor?.changeCombatInitiative(data.iniMod);
    }

    /**
     * Reboot an actors persona device.
     * 
     * Allow players / GM to overwrite the speaker through selections.
     */
    static async _onForceReboot(context: ActionResultOptions) {
        const message = game.messages?.get(context.messageId);
        if (!message) return;

        const actors = Helpers.getControlledTokenActors();
        if (!actors) {
            const speakerId = message.speaker.actor;
            if (!speakerId) return;
            const actor = game.actors?.get(speakerId);
            if (!actor) return;
        }

        for (const actor of actors) {
            await actor.rebootPersona();
        }
    }
}
