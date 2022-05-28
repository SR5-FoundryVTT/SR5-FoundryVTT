import DamageData = Shadowrun.DamageData;
import {PartsList} from "../parts/PartsList";
import {Helpers} from "../helpers";
import {CombatRules} from "./CombatRules";
import MinimalActionData = Shadowrun.MinimalActionData;
import {SR} from "../constants";
import ActorAttribute = Shadowrun.ActorAttribute;

export class CombatSpellRules {
    /**
     * Calculate combat spell damage as defined in SR5#283 Combat Spells Direct section.
     *
     * This includes only the attack portion of damage calculation.
     *
     * @param damage The DamageData so far.
     */
    static calculateDirectDamage(damage: DamageData): DamageData {
        // damage.mod = PartsList.AddUniquePart(damage.mod, 'SR5.AttackerHits', attackerHits);
        // Helpers.calcTotal(damage, {min: 0});
        return damage;
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

    static directCombatDefenseAction(): MinimalActionData {
        return {
            skill: '',
            attribute: SR.defense.spell.direct.mana as ActorAttribute,
            attribute2: '',
            mod: 0
        }
    }
}