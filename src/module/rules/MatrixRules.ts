import { SR5Actor } from "../actor/SR5Actor";
import { SR5 } from "../config";
import { SR } from "../constants";
import { DataDefaults } from "../data/DataDefaults";
import { Helpers } from "../helpers";
import { SR5Item } from "../item/SR5Item";
import { PartsList } from "../parts/PartsList";
import { BiofeedbackDamageType, DamageType } from '../types/item/Action';

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
     * Public Grid Modifier applies a -2 dice pool penalty to all matrix actions
     * SR5 pg 233 - 234
     */
    static publicGridModifier(): number {
        return -2;
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

    /**
     * Determine the maximum count of PAN slaves for a master device.
     * 
     * See SR5#233 'PANS and WANS'
     * @param rating The device rating of the master device
     * @returns The max amount of slaves
     */
    static maxPANSlaves(rating: number): number {
        return rating * 3;
    }

    /**
     * Determine if the current number of slaves in a PAN is valid.
     * 
     * See SR5#233 'PANS and WANS'
     * @param rating The device rating of the master device
     * @param slaves Amount of slaves in the PAN
     * 
     * @returns true, amount of slaves is valid.
     */
    static validPANSlaveCount(rating: number, slaves: number): boolean {
        return this.maxPANSlaves(rating) <= slaves;
    }

    /**
     * Determine if the given attributes result in an illegal matrix action rolled.
     * 
     * See SR5#231-232 'Overwatch Score and Convergence'
     * 
     * @param attribute 
     * @param attribute2 
     * @param limit 
     */
    static isIllegalAction(attribute: Shadowrun.ActorAttribute, attribute2: Shadowrun.ActorAttribute, limit: Shadowrun.ActorAttribute): boolean {
        for (const illegal of ['attack', 'sleaze']) {
            if (attribute === illegal || attribute2 === illegal || limit === illegal) return true;
        }

        return false;
    }

    /**
     * Sleaze Actions are defined as a test using the Sleaze attribute, generally as a Limit
     * see Sleaze Actions on pg 231
     * @param attribute
     * @param attribute2
     * @param limit
     */
    static isSleazeAction(attribute: Shadowrun.ActorAttribute, attribute2: Shadowrun.ActorAttribute, limit: Shadowrun.ActorAttribute): boolean {
        const illegal = 'sleaze';
        return attribute === illegal || attribute2 === illegal || limit === illegal;

    }

    /**
     * Attack Actions are defined as a test using the Attack attribute, generally as a Limit
     * see Attack Actions on pg 231
     * @param attribute
     * @param attribute2
     * @param limit
     */
    static isAttackAction(attribute: Shadowrun.ActorAttribute, attribute2: Shadowrun.ActorAttribute, limit: Shadowrun.ActorAttribute): boolean {
        const illegal = 'attack';
        return attribute === illegal || attribute2 === illegal || limit === illegal;

    }

    /**
     * At which score should Overwatch converge?
     * 
     * See SR5#231-232 'Overwatch Score and Convergence'
     * 
     */
    static overwatchConvergenceScore() {
        return 40;
    }

    /**
     * Determine if the given overwatch score should cause a Convergence by GOD.
     * 
     * See SR5#231-232 'Overwatch Score and Convergence'
     * 
     * @param score The overwatch score to check.
     */
    static isOverwatchScoreConvergence(score: number) {
        return score >= MatrixRules.overwatchConvergenceScore();
    }

    /**
     * Determine the damage value to convergence with.
     * 
     * See SR5#229-230 'User Mode' Virtual Reality sections.
     */
    static convergenceDamage(): DamageType {
        return DataDefaults.createData('damage', { base: 12, value: 12, type: { base: 'matrix', value: 'matrix' } });
    }

    /**
     * Determine the damage value dealt for failed Attack Actions
     *
     */
    static failedAttackDamage(biofeedback: BiofeedbackDamageType = ''): DamageType {
        return DataDefaults.createData('damage', { base: 1, value: 1, type: { base: 'matrix', value: 'matrix' }, biofeedback });
    }

    /**
     * Biofeedback damage is dealt as Physical or Stun SR5 229
     * - biofeedback is based on the incoming type of incoming biofeedback damage and if the target is in hotsim
     * - for instance, physical biofeedback damage becomes stun if the target isn't in hotsim
     */
    static createBiofeedbackDamage(value: number, hotSim: boolean, biofeedback: BiofeedbackDamageType = ''): DamageType {
        // if the biofeedback passed in isn't set, set it via the state of hotsim
        if (!biofeedback) {
            biofeedback = hotSim ? 'physical' : 'stun';
        }
        // if we aren't in hotsim, we will only ever take stun damage
        // some attacks will specifically do stun damage, even when in hotsim
        const actualBiofeedback = hotSim ? biofeedback : 'stun';
        return DataDefaults.createData('damage', {
            base: value,
            value,
            type: {
                base: actualBiofeedback,
                value: actualBiofeedback,
            }
        });
    }

    /**
     * Damage for Matrix dumpshock.
     * 
     * See SR5#229 'Dumpshock & Link-Locking'
     * @param hotSim Is the persona using a hot sim?
     */
    static dumpshockDamage(hotSim: boolean): DamageType {
        const damage = 6;

        return this.createBiofeedbackDamage(damage, hotSim);
    }

    static modifyDamageAfterHit(attackerHits: number, defenderHits: number, damage: DamageType): DamageType {
        const modified = foundry.utils.duplicate(damage) as DamageType;

        /**
         * Copied the following lines from CombatRules
         */
        // netHits should never be below zero...
        if (attackerHits < 0) attackerHits = 0;
        if (defenderHits < 0) defenderHits = 0;

        // add net hits as separate parts
        PartsList.AddUniquePart(modified.mod, 'SR5.Attacker', attackerHits);
        PartsList.AddUniquePart(modified.mod, 'SR5.Defender', -defenderHits);

        modified.value = Helpers.calcTotal(modified, { min: 0 });

        return modified;
    }

    /**
     * What active defenses are available for the given item? Based on SR5#190 'Active Defenses'
     * @param weapon The equipped weapon used for the attack.
     * @param actor The actor performing the attack.
     */
    static availableActiveDefenses(weapon: SR5Item, actor: SR5Actor): Shadowrun.ActiveDefenseData {
        // General purpose active defenses. ()
        const activeDefenses: Shadowrun.ActiveDefenseData = {
            full_defense: {
                label: 'SR5.FullMatrixDefense',
                value: actor.getMatrixFullDefenseAttribute()?.value,
                initMod: -10,
            },
        };

        // Intervene is defined in Kill Code pg39
        // this needs to perform a roll and then add the hits of that roll as a bonus modifier
        if (weapon.isSlave) {
            activeDefenses['intervene'] = {
                label: 'SR5.Intervene',
                value: 0, // TODO get actor's pan device to use for defending
                initMod: -5,
            }
        }

        return activeDefenses;
    }

    /**
     * Calculate the defense pool of a grid when a mark is placed on it
     * See SR5#238 'Brute Force' and SR5#240 'Hack on the Fly'
     * @param grid The grid defending against a mark placement action.
     */
    static gridMarkPlacementDefensePool(grid: SR5Item<'grid'>) {
        if (!grid.isType('grid')) return;

        if (grid.system.category === 'local')
            return { name: SR5.gridCategories.local, value: 4 }
        else if (grid.system.category === 'global')
            return { name: SR5.gridCategories.global, value: 6 };
        else
            return { name: SR5.gridCategories.public, value: 0 };
    }
}
