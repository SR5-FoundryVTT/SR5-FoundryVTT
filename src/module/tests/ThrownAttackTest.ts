import {SuccessTest} from "./SuccessTest";

/**
 * Test implementation for attack tests using weapon of category thrown.
 */
export class ThrownAttackTest extends SuccessTest {
    get canBeExtended() {
        return false;
    }
}