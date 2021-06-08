import { SR5Actor } from '../actor/SR5Actor';
import { SR5 } from '../config';
import { Helpers } from '../helpers';
import { PartsList } from '../parts/PartsList';
import DamageData = Shadowrun.DamageData;
import ActorArmorData = Shadowrun.ActorArmorData;
import ModifiedDamageData = Shadowrun.ModifiedDamageData;
import ModifiableValue = Shadowrun.ModifiableValue;
import CharacterActorData = Shadowrun.CharacterData;
import SpellItemData = Shadowrun.SpellItemData;

/**
 * Soaking rules for actors
 */
export class SoakRules {

    /**
     * Determines the soak parts based on the damage and the actor type
     * @param soakParts List of (potentially prefilled) soak parts
     * @param actor The actor affected by the damage
     * @param damageData The damage
     */
    static applyAllSoakParts(soakParts: PartsList<number>, actor: SR5Actor, damageData: DamageData) {
        if (damageData.type.base !== 'matrix') {
            SoakRules.applyPhysicalAndStunSoakParts(soakParts, actor, damageData);
        } else {
            SoakRules.applyMatrixSoakParts(soakParts, actor);
        }
    }

    private static applyPhysicalAndStunSoakParts(soakParts: PartsList<number>, actor: SR5Actor, damageData: DamageData) {
        // Apply special rules for direct combat spells
        const damageSourceItem = Helpers.findDamageSource(damageData);
        if (damageSourceItem && damageSourceItem.isDirectCombatSpell()) {
            return SoakRules.applyDirectCombatSpellParts(damageSourceItem.data as SpellItemData, soakParts, actor);
        }

        SoakRules.applyBodyAndArmorParts(soakParts, actor);

        const armor = actor.getArmor();
        SoakRules.applyArmorPenetration(soakParts, armor, damageData);
        SoakRules.applyElementalArmor(soakParts, armor, damageData.element.base);
    }

    private static applyDirectCombatSpellParts(spellItem: SpellItemData, soakParts: PartsList<number>, actor: SR5Actor) {
        if (spellItem.data.type === 'mana') {
            SoakRules.addUniquePart(soakParts, actor.getAttribute('willpower'), SR5.attributes.willpower);
        }

        else {
            SoakRules.addUniquePart(soakParts, actor.getAttribute('body'), SR5.attributes.body);
        }

        return;
    }

    private static applyBodyAndArmorParts(soakParts: PartsList<number>, actor: SR5Actor) {
        const body = actor.findAttribute('body');
        if (body) {
            soakParts.addUniquePart(body.label || 'SR5.Body', body.value);
        }

        const mod = actor.getModifier('soak');
        if (mod) {
            soakParts.addUniquePart('SR5.Bonus', mod);
        }

        actor._addArmorParts(soakParts);
    }

    private static applyArmorPenetration(soakParts: PartsList<number>, armor: ActorArmorData, damageData: DamageData) {
        const bonusArmor = armor[damageData.element.value] ?? 0;
        const totalArmor = armor.value + bonusArmor;
        const ap = Helpers.calcTotal(damageData.ap);

        soakParts.addUniquePart('SR5.AP', Math.max(ap, -totalArmor));
    }

    private static applyElementalArmor(soakParts: PartsList<number>, armor: ActorArmorData, element: string) {
        const bonusArmor = armor[element] ?? 0;
        if (bonusArmor) {
            soakParts.addUniquePart(SR5.elementTypes[element], bonusArmor);
        }
    }

    private static applyMatrixSoakParts(soakParts: PartsList<number>, actor: SR5Actor) {
        const actorData = actor.data.data as CharacterActorData;

        // All actors have the same soak rules when they are not active in the matrix
        // TODO Technomancer and Sprites special rules?
        if (actorData.initiative.perception === 'matrix') {
            if (actor.isVehicle()){
                // Vehicles can have a matrix initiative but do not take biofeedback
                SoakRules.applyRatingAndFirewallParts(actorData, soakParts);
            }
            else {
                SoakRules.applyBiofeedbackParts(soakParts, actor, actorData);
            }
        }

        else {
            SoakRules.applyRatingAndFirewallParts(actorData, soakParts);
        }
    }

    private static applyBiofeedbackParts(soakParts: PartsList<number>, actor: SR5Actor, actorData: CharacterActorData) {
        SoakRules.addUniquePart(soakParts, actor.getAttribute('willpower'), SR5.attributes.willpower);

        if (!actorData.matrix) {
            return;
        }

        SoakRules.addUniquePart(soakParts, actorData.matrix.firewall, SR5.matrixAttributes.firewall);
    }

    private static applyRatingAndFirewallParts(actorData: CharacterActorData, soakParts: PartsList<number>) {
        if (!actorData.matrix) {
            return;
        }

        const deviceRating = actorData.matrix.rating;
        if (deviceRating) {
            soakParts.addUniquePart('SR5.Labels.ActorSheet.DeviceRating', deviceRating);
        }

        this.addUniquePart(soakParts, actorData.matrix.firewall, SR5.matrixAttributes.firewall);
    }

    private static addUniquePart(partsList: PartsList<number>, modifiableValue : ModifiableValue, label : string) {
        const totalValue = Helpers.calcTotal(modifiableValue);
        partsList.addUniquePart(label, totalValue);
    }

    /**
     * Reduces the damage value based on net hits and damage data and actor special rules
     *
     * @remarks
     * Make sure that you first call modifyDamageType before you call this method
     * to determine the correct damage type (physical, stun, matrix)
     *
     * @param damageData The incoming damage
     * @param hits The number of hits on the soak tests
     * @returns The updated damage data
     */
    static reduceDamage(actor: SR5Actor, damageData: DamageData, hits: number): ModifiedDamageData {

        // Vehicles are immune to stun damage (electricity stun damage is handled in a different place)
        // Note: This also takes care of the vehicle immunity, since physical damage that does not exceed armor
        // will be converted to stun damage and then reduced to 0. This does not work with drones wearing armor
        // but we do not support this.
        if (damageData.type.value === 'stun' && actor.isVehicle()) {
            return Helpers.reduceDamageByHits(damageData, damageData.value, 'SR5.VehicleStunImmunity');
        }

        return Helpers.reduceDamageByHits(damageData, hits, 'SR5.SoakTest');
    }

    /**
     * Changes the damage type based on the incoming damage type and the actor state (armor, matrix perception..)
     * @param damage The incoming damage
     * @param actor The actor affected by the damage
     * @returns The updated damage data
     */
    static modifyDamageType(damage: DamageData, actor : SR5Actor) : DamageData {
        // Careful, order of damage conversion is very important
        // Electricity stun damage is considered physical for vehicles
        let updatedDamage = duplicate(damage) as DamageData;
        if (actor.isVehicle() && updatedDamage.element.value === 'electricity' && updatedDamage.type.value === 'stun') {
            updatedDamage.type.value = 'physical';
        }

        const damageSourceItem = Helpers.findDamageSource(damage);
        if (damageSourceItem && damageSourceItem.isDirectCombatSpell()) {
            // Damage from direct combat spells is never converted
            return updatedDamage;
        }

        updatedDamage = SoakRules.modifyPhysicalDamageForArmor(updatedDamage, actor);
        return SoakRules.modifyMatrixDamageForBiofeedback(updatedDamage, actor);
    }

    /**
     * Turns physical damage to stun damage based on the damage and armor
     * @param damage The incoming damage
     * @param actor The actor affected by the damage
     * @returns The updated damage data
     */
     static modifyPhysicalDamageForArmor(damage: DamageData, actor : SR5Actor): DamageData {
        const updatedDamage = duplicate(damage) as DamageData;

        if (damage.type.value === 'physical') {
            // Physical damage is only transformed for some actors
            if (!actor.isCharacter() && !actor.isSpirit() && !actor.isCritter() && !actor.isVehicle()) {
                return updatedDamage;
            }

            const modifiedArmor = actor.getModifiedArmor(damage);
            if (modifiedArmor) {
                const armorWillChangeDamageType = modifiedArmor.value > damage.value;

                if (armorWillChangeDamageType) {
                    updatedDamage.type.value = 'stun';
                }
            }
        }

        return updatedDamage;
    }

    /**
     * Turns matrix damage to biofeedback based on the actor state
     * @param damage The incoming damage
     * @param actor The actor affected by the damage
     * @returns The updated damage data
     */
    static modifyMatrixDamageForBiofeedback(damage: DamageData, actor : SR5Actor): DamageData {
        const updatedDamage = duplicate(damage) as DamageData;

        if (damage.type.value === 'matrix') {
            const actorData = actor.data.data as CharacterActorData;

            // Only characters can receive biofeedback damage at the moment.
            // TODO Technomancer and Sprites special rules?
            if (!actor.isCharacter()) {
                return updatedDamage;
            }

            if (actorData.initiative.perception === 'matrix') {
                if (actorData.matrix.hot_sim) {
                    updatedDamage.type.value = 'physical';
                }
                else {
                    updatedDamage.type.value = 'stun';
                }
            }
        }

        return updatedDamage;
    }
}