import { FLAGS, SYSTEM_NAME } from "../constants";
import { SuccessTest } from "../tests/SuccessTest";
import { TestCreator } from "../tests/TestCreator";

/**
 * The system needs a place to override default ChatMessage behaviors, making it necessary to replace the default implementation.
 * 
 * If you need to add chat related features, events and listeners you should do so here.
 */
export class SR5ChatMessage extends ChatMessage {
    /**
     * Return a SuccessTest implementation for this chat message instance, if there is one.
     */
    get test(): SuccessTest | undefined {
        // Check if message contains any test data.
        const flagData = this.getFlag(SYSTEM_NAME, FLAGS.Test);
        if (flagData === null || flagData === undefined) return;
        if (this.id === null || this.id === '') return;

        return TestCreator._fromMessageTestData(flagData);
    }
}