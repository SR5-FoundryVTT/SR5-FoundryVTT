import {SR} from "../constants";

export class MatrixRules {
    /**
     * Calculate the matrix condition monitor based on SR5#228 'Matrix Damage'
     *
     * The result is round up as for physical and stun monitor (SR5#101), even though it's not specified for
     * matrix monitors specifically.
     *
     * @param deviceRating The device rating of the matrix device for the condition monitor.
     * @return The condition max condition monitor value
     */
    static getConditionMonitor(deviceRating: number): number {
        deviceRating = Math.max(deviceRating, 0);
        return Math.ceil(8 + (deviceRating / 2));
    }

    /**
     * Derive the IC device rating based of it's hosts rating based on SR5#247 'Intrusion Countermeasures'
     *
     * @param hostRating
     */
    static getICDeviceRating(hostRating: number): number {
        return Math.max(hostRating, 0);
    }

    /**
     * Derive the IC initiative base value of it's host based on SR5#230 'Hot-SIM VR' and SR5#247 'Intrusion Countermeasures'
     *
     * @param hostRating A positive host rating.
     * @return Note, this value will be at least a zero.
     */
    static getICInitiativeBase(hostRating: number): number {
        return Math.max(hostRating * 2, 0);
    }

    /**
     * Get the amount of initiative dice IC has based on SR5#247 'Intrusion Countermeasures'
     *
     * @returns Note, this value will be at least a zero.
     */
    static getICInitiativeDice(): number {
        return Math.max(SR.initiatives.ic.dice, 0);
    }
}