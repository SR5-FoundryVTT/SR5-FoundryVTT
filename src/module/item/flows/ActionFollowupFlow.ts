import { TestCreator } from "../../tests/TestCreator";

/**
 * Handle manually initiating a follow up test on an action based test.
 * 
 * This would be triggered from a chat message interaction, with the chat message containing the test to follow up on.
 */
export const ActionFollowupFlow = {
    chatLogListeners: async (message: ChatLog, html, data) => {
        // setup chat listener messages for each message as some need the message context instead of chatlog context.
        html.find('.chat-message').each(async (index, element) => {
            element = $(element);
            const id = element.data('messageId');
            const message = game.messages?.get(id);
            if (!message) return;

            await ActionFollowupFlow.chatMessageListeners(message, element, message.toObject())
        });
    },

    chatMessageListeners: async (message: ChatMessage, html, data) => {
        html.find('.followup-action').on('click', ActionFollowupFlow.castFollowupAction);
    },

    castFollowupAction: async (event) => {
        event.preventDefault();

        const button = $(event.currentTarget);
        const card = button.closest('.chat-message');
        const messageId = card.data('messageId');

        const test = await TestCreator.fromMessage(messageId);
        if (!test) return;

        // Populate data before executing follow up.
        await test.populateTests();
        await test.populateDocuments();

        // NOTE: Async but at the functions end.
        test.executeFollowUpTest();
    }
};