import { TestCreator } from "../../tests/TestCreator";

/**
 * Handle manually initiating a follow up test on an action based test.
 * 
 * This would be triggered from a chat message interaction, with the chat message containing the test to follow up on.
 */
export const ActionFollowupFlow = {
    chatMessageListeners: async (message: ChatMessage, html, data) => {
        $(html).find('.followup-action').on('click', ActionFollowupFlow.castFollowupAction.bind(this));
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
        void test.executeFollowUpTest();
    }
};
