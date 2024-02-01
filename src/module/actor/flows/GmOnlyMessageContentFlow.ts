import { SR5Actor } from './../SR5Actor';
import { FLAGS, SYSTEM_NAME } from "../../constants";
import { TestCreator } from '../../tests/TestCreator';

/**
 * Handle display of chat message content for GM public messages for users with and without owner permissions
 * for the actor used in that test.
 * 
 * This is reliant on the gm content only setting being set.
 * 
 * If the settings is active, a public GM test chat message will be marked as having 'gm only content'.
 * During rendering of that chat message on each users client, the content marked as 'gm only content' will be
 * hidden, if they don't owned the used actor for that test.
 */
export const GmOnlyMessageContentFlow = {
    /**
     * Add chat listener for GM only content.
     */
    async chatMessageListeners(message: ChatMessage, html: JQuery, data: any) {
        await GmOnlyMessageContentFlow.showGmOnlyContent(message, html, data);
    },
    /**
     * Should GMOnly content be applied or not?
     * 
     * With no actor given, only general user and settings will influence the result.
     * 
     * @param actor A optional actor reference
     * @returns true, when GMOnlyContent is to be used for chat message.
     */
    applyGmOnlyContent(actor?: SR5Actor): boolean {
        // Enable GM only content only when the global setting is set.
        const enableFeature = game.settings.get(SYSTEM_NAME, FLAGS.HideGMOnlyChatContent) as boolean;

        return enableFeature && !!game.user && game.user.isGM && !!actor;
    },

    /**
     * Callback handler for the Foundry 'renderChatMessage' hook.
     * 
     * Looks for chat messages containing success test data and show or hide 
     * any GM only content within their html depending on the user.
     * 
     * @param message The message to show gm-only-content for
     * @param html The DOM elements of the chat message contents
     * @param data The message data used to render the chat message
     */
    async showGmOnlyContent(message: ChatMessage, html, data) {
        // Directly access test data to avoid unnecessary test creation.
        const testData = TestCreator.getTestDataFromMessage(message.id as string);
        if (!testData?.data) return;
        const actorUuid = testData.data.sourceActorUuid as string;
        const actor = await fromUuid(actorUuid) as SR5Actor | null;

        // SuccessTest doesn't NEED an actor, if one is cast that way: show gm-only-content
        if (!actor || !game.user) {
            html.find('.gm-only-content').removeClass('gm-only-content');
            // @ts-expect-error TODO: foundry-vtt-types v10
            ui.chat.scrollBottom();
        }
        else if (game.user.isGM || game.user.isTrusted || actor.isOwner) {
            html.find('.gm-only-content').removeClass('gm-only-content');
            // @ts-expect-error TODO: foundry-vtt-types v10
            ui.chat.scrollBottom();
        }
    }
};