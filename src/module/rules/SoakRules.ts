import { SR5Actor } from '../actor/SR5Actor';
import { Helpers } from '../helpers';
import { DamageType } from '../types/item/Action';
import { ModifiedDamageType } from '../types/rolls/ActorRolls';

/**
 * Soaking rules for actors
 */
export class SoakRules {
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
    static reduceDamage(actor: SR5Actor, damageData: DamageType, hits: number): ModifiedDamageType {

        // Vehicles are immune to stun damage (electricity stun damage is handled in a different place)
        // Note: This also takes care of the vehicle immunity, since physical damage that does not exceed armor
        // will be converted to stun damage and then reduced to 0. This does not work with drones wearing armor
        // but we do not support this.
        if (damageData.type.value === 'stun' && actor.isType('vehicle')) {
            return Helpers.reduceDamageByHits(damageData, damageData.value, 'SR5.VehicleStunImmunity');
        }

        return Helpers.reduceDamageByHits(damageData, hits, 'SR5.SoakTest');
    }

    /**
     * Turns physical damage to stun damage based on the damage and armor
     * @param damage The incoming damage
     * @param actor The actor affected by the damage
     * @returns The updated damage data
     */
    static modifyPhysicalDamageForArmor(damage: DamageType, actor: SR5Actor): DamageType {
        const updatedDamage = foundry.utils.duplicate(damage) as DamageType;

        if (damage.type.value === 'physical') {
            // Physical damage is only transformed for some actors
            if (!actor.isType('character', 'spirit', 'vehicle')) {
                return updatedDamage;
            }

            const modArmor = actor.getArmor(damage);
            const changeDamageType = modArmor.rating.value + modArmor.hardened.value > damage.value;

            if (changeDamageType) {
                updatedDamage.type.value = 'stun';
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
    static modifyMatrixDamageForBiofeedback(damage: DamageType, actor : SR5Actor): DamageType {
        const updatedDamage = foundry.utils.duplicate(damage) as DamageType;

        if (damage.type.value === 'matrix') {
            // Only characters can receive biofeedback damage at the moment.
            // TODO Technomancer and Sprites special rules?
            if (!actor.isType('character')) {
                return updatedDamage;
            }

            if (actor.system.initiative.perception === 'matrix') {
                if (actor.system.matrix.hot_sim) {
                    updatedDamage.type.value = 'physical';
                } else {
                    updatedDamage.type.value = 'stun';
                }
            }
        }

        return updatedDamage;
    }
}