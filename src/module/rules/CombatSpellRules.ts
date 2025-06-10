import {Helpers} from "../helpers";
import {CombatRules} from "./CombatRules";
import { SR5Actor } from "../actor/SR5Actor";
import {PartsList} from "../parts/PartsList";
import {DataDefaults} from "../data/DataDefaults";
import { DamageType, MinimalActionType } from "../types/item/Action";

type SpellType = Item.SystemOfType<'spell'>['type'];
type CombatSpellType = Item.SystemOfType<'spell'>['combat']['type'];

export class CombatSpellRules {
    /**
     * Calculate combat spell damage as defined in SR5#283 Combat Spells Direct section.
     *
     * This includes only the attack portion of damage calculation.
     *
     * @param damage The DamageData so far.
     */
    static calculateDirectDamage(damage: DamageType): DamageType {
        return foundry.utils.duplicate(damage) as DamageType;
    }

    /**
     * Calculate combat spell damage as defined in SR5#283 Combat Spells Indirect section.
     *
     * This includes only the attack portion of damage calculation.
     *
     * @param damage The DamageData so far.
     * @param force The force used during combat spell.
     */
    static calculateIndirectDamage(damage: DamageType, force: number): DamageType {
        damage = foundry.utils.duplicate(damage) as DamageType;

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
     * @param defender The active defender
     * @param damage Incoming damage including base damage values.
     * @param attackerHits The attackers hits achieved
     * @param defenderHits The defenders hits achieved
     */
    static modifyDirectDamageAfterHit(defender: SR5Actor, damage: DamageType, attackerHits: number, defenderHits: number): DamageType {
        return CombatRules.modifyDamageAfterHit(defender, attackerHits, defenderHits, damage);
    }

    static modifyIndirectDamageAfterHit(defender: SR5Actor, damage: DamageType, attackerHits: number, defenderHits): DamageType {
        return CombatRules.modifyDamageAfterHit(defender, attackerHits, defenderHits, damage);
    }

    static modifyDamageAfterMiss(damage: DamageType): DamageType {
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
    static calculateBaseDamage(type: CombatSpellType, damage: DamageType, force: number): DamageType {
        switch (type) {
            case 'indirect':
                return CombatSpellRules.calculateIndirectDamage(damage, force);
            case 'direct':
                return CombatSpellRules.calculateDirectDamage(damage);
        }

        return foundry.utils.duplicate(damage) as DamageType;
    }

    /**
     * Modify incoming damage for a combat spell after the spell hit the defending target according to SR5#283 Section 'Combat Defense'
     *
     * @param defender The active defender
     * @param spellType The general spell type.
     * @param combatType The combat spell type.
     * @param damage The incoming damage.
     * @param attackerHits Hits achieved by the spell attack aster.
     * @param defenderHits Hits achieved by the defender against the spell attack.
     */
    static modifyDamageAfterHit(defender: SR5Actor, spellType: SpellType, combatType: CombatSpellType, damage: DamageType, attackerHits: number, defenderHits: number): DamageType {

        if (spellType === 'mana' && combatType === 'direct') {
            return CombatSpellRules.modifyDirectDamageAfterHit(
                defender,
                damage,
                attackerHits,
                defenderHits);
        }
        if (spellType === 'physical' && combatType === 'direct') {
            return CombatSpellRules.modifyDirectDamageAfterHit(
                defender,
                damage,
                attackerHits,
                defenderHits);
        }
        if (combatType === 'indirect') {
            return CombatSpellRules.modifyIndirectDamageAfterHit(
                defender,
                damage,
                attackerHits,
                defenderHits);
        }

        return foundry.utils.duplicate(damage) as DamageType;
    }

    /**
     * Return a testable action for combat spell defense based on SR5#283 Section 'Combat Defense'
     *
     * @param spellType The general spell type.
     * @param combatType The combat spell type.
     */
    static defenseTestAction(spellType: SpellType, combatType: CombatSpellType): MinimalActionType {
        if (spellType === '' || combatType === '')
            console.warn(`Shadowrun5e | The given spell or combat spell types are empty and won't form a complete defense test action`);

        const itemAction = DataDefaults.createData('minimal_action');

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