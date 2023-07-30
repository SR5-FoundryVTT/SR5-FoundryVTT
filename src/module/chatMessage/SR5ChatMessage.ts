import { FLAGS, SYSTEM_NAME } from "../constants";
import { SR5ActiveEffect } from "../effect/SR5ActiveEffect";
import { SuccessTest } from "../tests/SuccessTest";
import { TestCreator } from "../tests/TestCreator";

/**
 * TODO: DOcumentation
 */
export class SR5ChatMessage extends ChatMessage {
    get test(): SuccessTest | undefined {
        // Check if message contains any test data.
        const flagData = this.getFlag(SYSTEM_NAME, FLAGS.Test);
        if (!flagData) return;
        if (!this.id) return;

        return TestCreator._fromMessageTestData(flagData);
    }
}