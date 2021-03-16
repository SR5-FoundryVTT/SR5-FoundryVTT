import {SR5Actor} from "./SR5Actor";
import DamageData = Shadowrun.DamageData;
import { Helpers } from '../helpers';
import {PartsList} from "../parts/PartsList";
import ActorArmorData = Shadowrun.ActorArmorData;
import ModifiedDamageData = Shadowrun.ModifiedDamageData;

/**
 * Soaking rules for actors
 */
export class SoakRules {

    static applyDamageIndependentSoakParts(soakParts: PartsList<number>, actor : SR5Actor) {
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

    static applyArmorPenetration(soakParts: PartsList<number>, armor: ActorArmorData, damageData : DamageData) {
        const bonusArmor = armor[damageData.element.value] ?? 0;
        const totalArmor = armor.value + bonusArmor;
        const ap = Helpers.calcTotal(damageData.ap);

        soakParts.addUniquePart('SR5.AP', Math.max(ap, -totalArmor));
    }

    static applyElementalArmor(soakParts: PartsList<number>, armor: ActorArmorData, element: string) {
        const bonusArmor = armor[element] ?? 0;
        if (bonusArmor) {
            soakParts.addUniquePart(CONFIG.SR5.elementTypes[element], bonusArmor);
        }
    }

    static reduceDamage(damageData : DamageData, hits : number) : ModifiedDamageData {
        return Helpers.reduceDamageByHits(damageData, hits, 'SR5.SoakTest');
    }
}