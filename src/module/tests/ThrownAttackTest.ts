import {SuccessTest} from "./SuccessTest";

/**
 * Test implementation for attack tests using weapon of category thrown.
 */
export class ThrownAttackTest extends SuccessTest {
    override get canBeExtended() {
        return false;
    }
}