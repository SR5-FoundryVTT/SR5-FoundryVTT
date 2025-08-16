import {SR} from "../constants";
import {PartsList} from "../parts/PartsList";
import {Helpers} from "../helpers";
import {SoakRules} from "./SoakRules";
import {SR5Actor} from "../actor/SR5Actor";
import { DamageType } from "../types/item/Action";
import { ValueFieldType } from "../types/template/Base";

export class CombatRules {
    static iniOrderCanDoAnotherPass(scores: number[]): boolean {
        for (const score of scores) {
            if (CombatRules.iniScoreCanDoAnotherPass(score)) return true;
        }
        return false;
    }
    /**
     * Check if there is another initiative pass possible with the given score.
     * @param score
     * @return true means another initiative pass is possible
     */
    static iniScoreCanDoAnotherPass(score: number): boolean {
        return CombatRules.reduceIniResultAfterPass(score) > 0;
    }
    /**
     * Reduce the given initiative score according to @PDF SR5#159
     * @param score This given score can't be reduced under zero.
     */
    static reduceIniResultAfterPass(score: number): number {
        return Math.max(score + SR.combat.INI_RESULT_MOD_AFTER_INI_PASS, 0);
    }

    /**
     * Reduce the initiative score according to the current initiative pass @PDF SR5#160.
     * @param score
     * @param pass The current initiative pass. Each combat round starts at the initiative pass of 1.
     */
    static reduceIniOnLateSpawn(score: number, pass: number): number {
        // Assure valid score ranges.
        // Shift initiative pass value range from min 1 to min 0 for multiplication.
        pass = Math.max(pass - 1, 0);
        score = Math.max(score, 0);

        // Reduce the new score according to. NOTE: Modifier is negative
        const reducedScore = score + pass * SR.combat.INI_RESULT_MOD_AFTER_INI_PASS;
        return CombatRules.getValidInitiativeScore(reducedScore);
    }

    /**
     * Return a valid initiative score on updates or score changes
     *
     * @param score The initiative score after it's been updated.
     * @returns A valid initiative score
     */
    static getValidInitiativeScore(score: number): number {
        return Math.max(score, 0);
    }

    /**
     * Determine if an attack hits the defender based on their hits.
     *
     * According to combat sequence (SR5#173) part defend.
     *
     * @param attackerHits
     * @param defenderHits
     * @returns true, when the attack hits.
     */
    static attackHits(attackerHits: number, defenderHits: number): boolean {
        return attackerHits > defenderHits;
    }

    /**
     * Determine if an attack grazes the defender.
     *
     * According to combat sequence (SR5#173) part defend.
     *
     * @param attackerHits
     * @param defenderHits
     * @returns true, when the attack grazes.
     */
    static attackGrazes(attackerHits: number, defenderHits: number): boolean {
        return attackerHits === defenderHits;
    }

    /**
     * Determine if an attack misses the defender based on their hits.
     *
     * According to combat sequence (SR5#173) part defend.
     *
     * @param attackerHits
     * @param defenderHits
     * @returns true, when the attack hits.
     */
    static attackMisses(attackerHits: number, defenderHits: number): boolean {
        return !CombatRules.attackHits(attackerHits, defenderHits);
    }

    /**
     * Modify Damage according to combat sequence (SR5#173) part defend. Successful attack.
     *
     * @param defender The active defender
     * @param attackerHits The attackers hits. Should be a positive number.
     * @param defenderHits The attackers hits. Should be a positive number.
     * @param damage Incoming damage to be modified
     * @return A new damage object for modified damage.
     */
    static modifyDamageAfterHit(defender: SR5Actor, attackerHits: number, defenderHits: number, damage: DamageType): DamageType {
        let modified = foundry.utils.duplicate(damage) as DamageType;

        // netHits should never be below zero...
        if (attackerHits < 0) attackerHits = 0;
        if (defenderHits < 0) defenderHits = 0;

        // SR5#173  Step3: Defend B.
        PartsList.AddUniquePart(modified.mod, 'SR5.Attacker', attackerHits);
        PartsList.AddUniquePart(modified.mod, 'SR5.Defender', -defenderHits);
        modified.value = Helpers.calcTotal(modified, {min: 0});

        // SR5#173 Step 3: Defend B.
        modified = CombatRules.modifyDamageTypeAfterHit(modified, defender);

        return modified;
    }

    /**
     * Check if vehicle wouldn't take any damage due to vehicle armor rules (SR5#199)
     * @param incomingDamage The incoming damage
     * @param attackerHits The attackers hits. Should be a positive number.
     * @param defenderHits The attackers hits. Should be a positive number.
     * @param actor The active defender
     */
    static isBlockedByVehicleArmor(incomingDamage: DamageType, attackerHits: number, defenderHits: number, actor: SR5Actor): boolean {
        if(!actor.isType('vehicle')) {
            return false;
        }

        return CombatRules.isDamageLessThanArmor(incomingDamage, attackerHits, defenderHits, actor);
    }

    /**
     * Check if actor wouldn't take any damage due to hardened armor rules (SR5#397)
     * @param incomingDamage The incoming damage
     * @param attackerHits The attackers hits. Should be a positive number.
     * @param defenderHits The attackers hits. Should be a positive number.
     * @param actor The active defender
     */
    static isBlockedByHardenedArmor(incomingDamage: DamageType, attackerHits: number = 0, defenderHits: number = 0, actor: SR5Actor): boolean {
        const armor = actor.getArmor(incomingDamage);

        if(!armor.hardened) {
            return false;
        }

        return CombatRules.isDamageLessThanArmor(incomingDamage, attackerHits, defenderHits, actor);
    }

    /**
     * Check if incoming damage (modified by net hits) is less than the actor's armor (modified by AP).
     * Used for vehicle armor, hardened armor, and physical -> stun damage logic
     * @param incomingDamage The incoming damage
     * @param attackerHits The attackers hits. Should be a positive number.
     * @param defenderHits The attackers hits. Should be a positive number.
     * @param actor The active defender
     */
    static isDamageLessThanArmor(incomingDamage: DamageType, attackerHits: number, defenderHits: number, actor: SR5Actor): boolean {
        const modifiedDamage = CombatRules.modifyDamageAfterHit(actor, attackerHits, defenderHits, incomingDamage);

        const modifiedAv = actor.getArmor(incomingDamage).value;
        const modifiedDv = modifiedDamage.value;

        return modifiedDv < modifiedAv;
    }

    /**
     * Check if vehicle wouldn't take any damage due to non-electric stun damage
     * @param incomingDamage The incoming damage
     * @param actor The active defender
     */
    static doesNoPhysicalDamageToVehicle(incomingDamage: DamageType, actor: SR5Actor): boolean {
        return actor.isType('vehicle') && incomingDamage.type.value === 'stun' && incomingDamage.element.value !== "electricity";
    }

    /**
     * Modify damage according to suppression defense (SR5#179). Successful attack.
     * 
     * In case of suppression a successful attack just does weapon damage (base + ammunition)
     * 
     * @param damage The incoming weapon damage of the attack, unaltered.
     */
    static modifyDamageAfterSuppressionHit(damage: DamageType): DamageType {
        return foundry.utils.duplicate(damage) as DamageType;
    }

    /**
     * Modify damage according to combat sequence (SR5#173 part defend. Missing attack.
     * @param damage Incoming damage to be modified
     * @param isHitWithNoDamage Optional parameter used for physical defense tests when attack hits but will deal no damage
     * @return A new damage object for modified damage.
     */
    static modifyDamageAfterMiss(damage: DamageType, isHitWithNoDamage?: boolean): DamageType {
        const modifiedDamage = foundry.utils.duplicate(damage) as DamageType;

        // Keep base and modification intact, only overwriting the result.
        modifiedDamage.override = {name: 'SR5.TestResults.Success', value: 0};
        Helpers.calcTotal(modifiedDamage, {min: 0});
        modifiedDamage.ap.override = {name: 'SR5.TestResults.Success', value: 0};
        Helpers.calcTotal(modifiedDamage.ap);
        modifiedDamage.type.value = 'physical';

        // If attack hits but deals no damage, keep the element of the attack for any side effects.
        if(!isHitWithNoDamage) {
            modifiedDamage.element.value = '';
        }

        return modifiedDamage;
    }

    /**
     * Modify damage according to combat sequence (SR5#173 part defend B). Damage resistance.
     *
     * @param actor The actor resisting the damage
     * @param damage Incoming damage to be modified.
     * @param hits The resisting tests hits
     * @return A new damage object for modified damage.
     */
    static modifyDamageAfterResist(actor: SR5Actor, damage: DamageType, hits: number): DamageType {
        if (hits < 0) hits = 0;

        // modifiedDamage.mod = PartsList.AddUniquePart(modifiedDamage.mod, 'SR5.Resist', -hits);
        let {modified} = SoakRules.reduceDamage(actor, damage, hits);

        Helpers.calcTotal(modified, {min: 0});

        return modified;
    }

    /**
     * Modify amor according to combat sequence (SR5#173) part defend.
     *
     * @param armor An armor value to be modified.
     * @param damage The damage containing the armor penetration to be applied.
     * @returns A new armor value for modified armor
     */
    static modifyArmorAfterHit(armor: ValueFieldType, damage: DamageType): ValueFieldType {
        const modifiedArmor = foundry.utils.duplicate(armor) as ValueFieldType;

        // ignore ap without effect
        if (damage.ap.value <= 0) return modifiedArmor;

        console.error('Check if ap is a negative value or positive value during weapon item configuration');
        PartsList.AddUniquePart(modifiedArmor.mod, 'SR5.AP', damage.ap.value);
        modifiedArmor.value = Helpers.calcTotal(modifiedArmor, {min: 0});

        return modifiedArmor;
    }

    /**
     * Changes the damage type based on the incoming damage type and the actor state (armor, matrix perception..)
     * @param damage The incoming damage
     * @param actor The actor affected by the damage
     * @returns The updated damage data
     */
    static modifyDamageTypeAfterHit(damage: DamageType, actor : SR5Actor) : DamageType {
        // Careful, order of damage conversion is very important
        // Electricity stun damage is considered physical for vehicles
        let updatedDamage = foundry.utils.duplicate(damage) as DamageType;
        if (actor.isType('vehicle') && updatedDamage.element.value === 'electricity' && updatedDamage.type.value === 'stun') {
            updatedDamage.type.value = 'physical';
        }

        const damageSourceItem = Helpers.findDamageSource(damage);
        if (damageSourceItem && damageSourceItem.isCombatSpell() && damageSourceItem.system.combat.type === 'direct') {
            // Damage from direct combat spells is never converted
            return updatedDamage;
        }

        updatedDamage = SoakRules.modifyPhysicalDamageForArmor(updatedDamage, actor);
        return SoakRules.modifyMatrixDamageForBiofeedback(updatedDamage, actor);
    }

    /**
     * Determine the amount of initiative score modifier change.
     * 
     * According to SR5#170 'Wound Modifiers'.
     * 
     * @param woundModBefore A negative wound modifier, before taking latest damage.
     * @param woundModAfter A negative wound modifier, after taking latest damage.
     * @return An to be applied initiative score modifier
     */
    static combatInitiativeScoreModifierAfterDamage(woundModBefore: number, woundModAfter: number): number {
        // Make sure no positive values are passed into.
        return Math.min(woundModBefore, 0) - Math.min(woundModAfter, 0);
    }

    /**
     * Can a defense mode be used with a specific initiative score
     * 
     * @param iniScore The combatants ini score
     * @param defenseIniScoreMod  The defense modes ini score modifier
     */
    static canUseActiveDefense(iniScore: number, defenseIniScoreMod: number): boolean {
        // Validate input values against valid value range.
        return (Math.max(iniScore, 0) + Math.min(defenseIniScoreMod, 0)) < 0
    }

    /**
     * Calculate defense modifier for multiple previous attacks in a combat turn. 
     * 
     * See SR5#189 'Defense Modifiers Table'.
     * 
     * @param attacks Amount of attacks within the current combat turn
     * @returns A negative modifier or zero to be applied on physical defense tests.
     */
    static defenseModifierForPreviousAttacks(attacks: number): number {
        return Math.max(attacks, 0) * -1;
    }

    /**
     * Calculate the initiative score adjustment to be made for damage taken during active combat
     * 
     * See SR5.160 'Changing Initiative'
     * 
     * @param woundsBefore Wound modifier (-2) before damage has been taken
     * @param woundsAfter Wound modifier (-3) after damage has been taken
     */
    static initiativeScoreWoundAdjustment(woundsBefore: number, woundsAfter: number) {
        return woundsAfter - woundsBefore;
    }
}