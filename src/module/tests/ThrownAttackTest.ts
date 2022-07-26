import {SuccessTest} from "./SuccessTest";

/**
 * Test implementation for attack tests using weapon of category thrown.
 */
export class ThrownAttackTest extends SuccessTest {
    get canBeExtended() {
        return false;
    }

    /**
     * While an attack can succeed,it's not really successful until defense.
     */
    get successLabel() {
        return "SR5.Results";
    }
}