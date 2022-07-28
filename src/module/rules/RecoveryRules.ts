export const RecoveryRules = {
    /**
     * Can an actor heal physical damage depends on its stun track according to SR5#207 section 'Glitches&Healing'
     *
     * @param stunBoxes
     */
    canHealPhysicalDamage: (stunBoxes: number): boolean => {
        return stunBoxes === 0;
    }
}