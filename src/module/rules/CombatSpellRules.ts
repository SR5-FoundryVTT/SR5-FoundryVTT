import DamageData = Shadowrun.DamageData;
import {PartsList} from "../parts/PartsList";
import {Helpers} from "../helpers";
import {CombatRules} from "./CombatRules";
import CombatSpellType = Shadowrun.CombatSpellType;
import SpellType = Shadowrun.SpellType;
import MinimalActionData = Shadowrun.MinimalActionData;
import {DefaultValues} from "../data/DataDefaults";

export class CombatSpellRules {
    /**
     * Calculate combat spell damage as defined in SR5#283 Combat Spells Direct section.
     *
     * This includes only the attack portion of damage calculation.
     *
     * @param damage The DamageData so far.
     */
    static calculateDirectDamage(damage: DamageData): DamageData {
        return foundry.utils.duplicate(damage);
    }

    /**
     * Calculate combat spell damage as defined in SR5#283 Combat Spells Indirect section.
     *
     * This includes only the attack portion of damage calculation.
     *
     * @param damage The DamageData so far.
     * @param force The force used during combat spell.
     */
    static calculateIndirectDamage(damage: DamageData, force: number): DamageData {
        damage = foundry.utils.duplicate(damage);

        const ap = -force;
        damage.ap.mod = PartsList.AddUniquePart(damage.ap.mod, 'SR5.Force', ap);
        damage.mod = PartsList.AddUniquePart(damage.mod, 'SR5.Force', force);

        // Armor piercing can both be a negative and positive value.
        Helpers.calcTotal(damage.ap);
        Helpers.calcTotal(damage, {min: 0});

        return damage;
    }

    /**
     * Modify incoming direct combat spell damage as defined in SR5#283 Combat Spell direct section.
     *
     * @param damage Incoming damage including base damage values.
     * @param attackerHits The attackers hits achieved
     * @param defenderHits The defenders hits achieved
     */
    static modifyDirectDamageAfterHit(damage: DamageData, attackerHits: number, defenderHits: number): DamageData {
        return CombatRules.modifyDamageAfterHit(attackerHits, defenderHits, damage);
    }

    static modifyIndirectDamageAfterHit(damage: DamageData, attackerHits: number, defenderHits): DamageData {
        return CombatRules.modifyDamageAfterHit(attackerHits, defenderHits, damage);
    }

    static modifyDamageAfterMiss(damage: DamageData): DamageData {
        return CombatRules.modifyDamageAfterMiss(damage);
    }

    /**
     * Should a damage resist test be allowed according to SR5#283 section 'Combat Spells'
     * @param type The general combat spell type.
     * @returns When true, a damage resist test should be cast.
     */
    static allowDamageResist(type: CombatSpellType): boolean {
        return type === 'indirect';
    }

    /**
     * Calculate base damage for all combat spell types.
     *
     * This will not include net hits after defense.
     *
     * @param type The combat spell type
     * @param damage The incoming damage
     * @param force Used force value during original spellcasting
     * @returns A modified damage resulting
     */
    static calculateBaseDamage(type: CombatSpellType, damage: DamageData, force: number): DamageData {
        switch (type) {
            case 'indirect':
                return CombatSpellRules.calculateIndirectDamage(damage, force);
            case 'direct':
                return CombatSpellRules.calculateDirectDamage(damage);
        }

        return foundry.utils.duplicate(damage);
    }

    /**
     * Modify incoming damage for a combat spell after the spell hit the defending target according to SR5#283 Section 'Combat Defense'
     *
     * @param spellType The general spell type.
     * @param combatType The combat spell type.
     * @param damage The incoming damage.
     * @param attackerHits Hits achieved by the spell attack aster.
     * @param defenderHits Hits achieved by the defender against the spell attack.
     */
    static modifyDamageAfterHit(spellType: SpellType, combatType: CombatSpellType, damage: DamageData, attackerHits: number, defenderHits: number): DamageData {

        if (spellType === 'mana' && combatType === 'direct') {
            return CombatSpellRules.modifyDirectDamageAfterHit(
                damage,
                attackerHits,
                defenderHits);
        }
        if (spellType === 'physical' && combatType === 'direct') {
            return CombatSpellRules.modifyDirectDamageAfterHit(
                damage,
                attackerHits,
                defenderHits);
        }
        if (combatType === 'indirect') {
            return CombatSpellRules.modifyIndirectDamageAfterHit(
                damage,
                attackerHits,
                defenderHits);
        }

        return foundry.utils.duplicate(damage);
    }

    /**
     * Return a testable action for combat spell defense based on SR5#283 Section 'Combat Defense'
     *
     * @param spellType The general spell type.
     * @param combatType The combat spell type.
     */
    static defenseTestAction(spellType: SpellType, combatType: CombatSpellType): MinimalActionData {
        if (spellType === '' || combatType === '')
            console.warn(`Shadowrun5e | The given spell or combat spell types are empty and won't form a complete defense test action`);

        const itemAction = DefaultValues.minimalActionData();

        if (spellType === 'mana' && combatType === 'direct') {
            itemAction.attribute = 'willpower';
        }
        if (spellType === 'physical' && combatType === 'direct') {
            itemAction.attribute = 'body';
        }
        if (combatType === 'indirect') {
            itemAction.attribute = 'reaction';
            itemAction.attribute2 = 'intuition';
        }

        return itemAction;
    }
}