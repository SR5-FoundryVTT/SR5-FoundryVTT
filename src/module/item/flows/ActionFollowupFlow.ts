import { TestCreator } from "../../tests/TestCreator";

/**
 * Handle manually initiating a follow up test on an action based test.
 * 
 * This would be triggered from a chat message interaction, with the chat message containing the test to follow up on.
 */
export const ActionFollowupFlow = {
    chatLogListeners: async (chatLog: ChatLog, html, data) => {
        const elements = $(html).find('.chat-message').toArray();

        for (const element of elements) {
            const id = $(element).data('messageId');
            const message = game.messages?.get(id);
            if (!message) continue;

            await ActionFollowupFlow.chatMessageListeners(message, element, message.toObject());
        }
    },

    chatMessageListeners: async (message: ChatMessage, html, data) => {
        $(html).find('.followup-action').on('click', ActionFollowupFlow.castFollowupAction);
    },

    castFollowupAction: async (event) => {
        event.preventDefault();

        const button = $(event.currentTarget);
        const card = button.closest('.chat-message');
        const messageId = card.data('messageId');

        const showDialog = TestCreator.shouldShowDialog(event);
        const test = await TestCreator.fromMessage(messageId, {showDialog});
        if (!test) return;

        // Populate data before executing follow up.
        await test.populateTests();
        await test.populateDocuments();

        // NOTE: Async but at the functions end.
        test.executeFollowUpTest();
    }
};