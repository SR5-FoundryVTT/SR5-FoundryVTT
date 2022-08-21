export class MeleeRules {
    /**
     * Determine melee defense reach modifier according to Meele Attack (SR5#186)
     *
     * @param incomingReach The attackers reach value
     * @param defendingReach The defenders reach value
     */
    static defenseReachModifier(incomingReach: number, defendingReach: number): number {
        return defendingReach - incomingReach;
    }
}