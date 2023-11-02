import { SR5Actor } from '../actor/SR5Actor';
import { Helpers } from '../helpers';
import DamageData = Shadowrun.DamageData;
import ModifiedDamageData = Shadowrun.ModifiedDamageData;
import CharacterActorData = Shadowrun.CharacterData;

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
    static reduceDamage(actor: SR5Actor, damageData: DamageData, hits: number): ModifiedDamageData {

        // Vehicles are immune to stun damage (electricity stun damage is handled in a different place)
        // Note: This also takes care of the vehicle immunity, since physical damage that does not exceed armor
        // will be converted to stun damage and then reduced to 0. This does not work with drones wearing armor
        // but we do not support this.
        if (damageData.type.value === 'stun' && actor.isVehicle()) {
            return Helpers.reduceDamageByHits(damageData, damageData.value, 'SR5.VehicleStunImmunity');
        }

        let armorData = actor.getArmor(damageData)

        // @ts-expect-error
        if(armorData.hardened) {
            if(damageData.value < armorData.value) {
                damageData.override = {name: 'SR5.Success', value: 0};
            }
            else {
                hits += Math.ceil(armorData.value/2);
            }
        }
        return Helpers.reduceDamageByHits(damageData, hits, 'SR5.SoakTest');
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
            const actorData = actor.system as CharacterActorData;

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