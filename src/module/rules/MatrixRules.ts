import { SR } from "../constants";

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
        deviceRating = Math.max(deviceRating, SR.attributes.ranges.host_rating.min);
        return Math.ceil(8 + (deviceRating / 2));
    }

    /**
     * Derive the IC device rating based of it's hosts rating based on SR5#247 'Intrusion Countermeasures'
     *
     */
    static getICDeviceRating(hostRating: number): number {
        return Math.max(hostRating, SR.attributes.ranges.host_rating.min);
    }

    /**
     * Derive the IC initiative base value of it's host based on SR5#230 'Hot-SIM VR' and SR5#247 'Intrusion Countermeasures'
     *
     * @param hostRating A positive host rating.
     */
    static getICInitiativeBase(hostRating: number): number {
        return Math.max(hostRating * 2, SR.attributes.ranges.host_rating.min);
    }

    /**
     * Get the amount of initiative dice IC has based on SR5#247 'Intrusion Countermeasures'
     *
     */
    static getICInitiativeDice(): number {
        return Math.max(SR.initiatives.ic.dice, SR.initiatives.ranges.dice.min);
    }

    /**
     * Derive the base value of any meat attribute an IC uses based on SR5#237 'Matrix actions', SR5#256 'Agents'
     * and SR5#247 'Intrusion Countermeasures'
     *
     */
    static getICMeatAttributeBase(hostRating: number): number {
        return Math.max(hostRating, SR.attributes.ranges.host_rating.min);
    }

    /**
     * Determine if the count of marks (to be placed) is allowed within the rules. SR5#240 'Hack on the Fly'
     * @param marks
     */
    static isValidMarksCount(marks: number): boolean {
        return marks >= MatrixRules.minMarksCount() && marks <= MatrixRules.maxMarksCount() && marks % 1 === 0;
    }

    static maxMarksCount(): number {
        return 3;
    }

    static minMarksCount(): number {
        return 0;
    }

    /**
     * Amount of marks that is valid in general for a target (includes zero marks)
     * @param marks The possibly faulty amount of marks
     * @returns A valid amount of marks
     */
    static getValidMarksCount(marks: number): number {
        marks = Math.min(marks, MatrixRules.maxMarksCount());
        return Math.max(marks, MatrixRules.minMarksCount());
    }

    /**
     * Amount of marks that can be placed. SR5#240 'Hack on the Fly'
     * @param marks The possibly faulty amount of marks
     * @returns A valid amount of marks
     */
    static getValidMarksPlacementCount(marks: number): number {
        // As we handle mark placement, we must assure at least one mark is placed.
        marks = Math.min(marks, MatrixRules.maxMarksCount());
        return Math.max(marks, 1);
    }


    /**
     * Return modifier for marks placed. See SR5#240 'Hack on the Fly' or SR5#238 'Brut Force'
     * @param marks Mount of marks to be placed
     */
    static getMarkPlacementModifier(marks: number): number {
        marks = MatrixRules.getValidMarksPlacementCount(marks);

        // Only handle cases with actual modifiers and otherwise return zero for a secure fallback.
        switch (marks) {
            case 2: return -4;
            case 3: return -10;
        }
        return 0;
    }

    /**
     * Derive a hosts attributes ratings based on it's host rating. SR5#247 'Host Attributes'
     * @param hostRating
     */
    static hostMatrixAttributeRatings(hostRating): number[] {
        return [0, 1, 2, 3].map(rating => rating + hostRating);
    }

    /**
     * Determine the modifier when decking a target on a different Grid. See SR5#233 'Grids on a run'
     */
    static differentGridModifier(): number {
        return -2;
    }
}