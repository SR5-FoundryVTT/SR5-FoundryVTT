import { FLAGS, SYSTEM_NAME } from "../constants";
import { SuccessTest } from "../tests/SuccessTest";
import { TestCreator } from "../tests/TestCreator";

/**
 * The system needs a place to override default ChatMessage behaviors, making it necessary to replace the default implementation.
 * 
 * If you need to add chat related features, events and listeners you should do so here.
 */
export class SR5ChatMessage extends ChatMessage {
    get _testData(): any {
        return this.flags.shadowrun5e.TestData;
    }
    /**
     * Return a SuccessTest implementation for this chat message instance, if there is one.
     */
    get test(): SuccessTest | undefined {
        // Check if message contains any test data.
        const flagData = this._testData;
        if (flagData === null || flagData === undefined) return;
        if (this.id === null || this.id === '') return;

        return TestCreator._fromMessageTestData(flagData);
    }

    /**
     * Foundry checks by looking at it's rolls, while the system stores those within test data.
     * 
     * If no test is imbeded, hand over control to Foundry to still support default roll chat messages
     * that have been manually or otherwise sent.
     */
    override get isRoll(): boolean {
        return foundry.utils.getType(this._testData) === 'Object' || super.isRoll;
    }
}