import { SR5Actor } from './SR5Actor';
import { SR5 } from '../config';
import { Helpers } from '../helpers';
import { PartsList } from '../parts/PartsList';
import DamageData = Shadowrun.DamageData;
import ActorArmorData = Shadowrun.ActorArmorData;
import ModifiedDamageData = Shadowrun.ModifiedDamageData;
import ModifiableValue = Shadowrun.ModifiableValue;
import CharacterActorData = Shadowrun.CharacterActorData;

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
        console.log("All soak parts");
        if (damageData.type.base !== 'matrix') {
            SoakRules.applyMundaneAttackSoakParts(soakParts, actor, damageData);
        } else {
            SoakRules.applyMatrixSoakParts(soakParts, actor);
        }
    }

    private static applyMundaneAttackSoakParts(soakParts: PartsList<number>, actor: SR5Actor, damageData: DamageData) {
        SoakRules.applyBodyAndArmorParts(soakParts, actor);

        const armor = actor.getArmor();
        SoakRules.applyArmorPenetration(soakParts, armor, damageData);
        SoakRules.applyElementalArmor(soakParts, armor, damageData.element.base);
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
            soakParts.addUniquePart(CONFIG.SR5.elementTypes[element], bonusArmor);
        }
    }

    private static applyMatrixSoakParts(soakParts: PartsList<number>, actor: SR5Actor) {
        const actorData = actor.data.data as CharacterActorData;

        // All actors have the same soak rules when they are not active in the matrix
        // TODO Technomancer and Sprites special rules?
        if (actorData.initiative.perception !== 'matrix') {
            SoakRules.applyBiofeedbackParts(soakParts, actor, actorData);
        }

        else {
            if (!actor.isVehicle()){
                SoakRules.applyBiofeedbackParts(soakParts, actor, actorData);
            }

            else {
                // Vehicles can have a matrix initiative but do not take biofeedback
                SoakRules.applyRatingAndFirewallParts(actorData, soakParts);       
            }
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
     * Reduces the damage value
     * At the moment just reduces the damage by the number of hits.
     * @param damageData The incoming damage
     * @param hits The number of hits on the soak tests
     * @returns The updated damage data
     */
    static reduceDamage(damageData: DamageData, hits: number): ModifiedDamageData {
        return Helpers.modifyDamageByHits(damageData, hits, 'SR5.SoakTest');
    }

    /**
     * Modifies the damage type based on the incoming damage and the actor type
     * @param damage The incoming damage
     * @param actor The actor affected by the damage 
     * @returns The updated damage data 
     */
    static modifyDamageType(damage: DamageData, actor : SR5Actor): DamageData {
        const updatedDamage = duplicate(damage);

        if (damage.type.value === 'physical') {
            // Physical damage is only transformed for some actors (e.g. not vehicles) 
            if (!actor.isCharacter() && !actor.isSpirit() && !actor.isCritter()) {
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

        else if (damage.type.value === 'matrix') {
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