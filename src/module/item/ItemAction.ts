/**
 * Handle all things related to the action template (template.json)
 */
import {SR5Actor} from "../actor/SR5Actor";
import DamageData = Shadowrun.DamageData;
import {Helpers} from "../helpers";

export class ItemAction {
    static calcDamage(damage: DamageData, actor: SR5Actor): DamageData {
        // Avoid manipulation on original data, which might come from database values.
        damage = duplicate(damage);

        const attribute = actor.findAttribute(damage.attribute);

        if (!attribute) return damage;

        switch (damage.base_formula_operator) {
            case "add":
                damage.value = damage.base + attribute.value;
                break;
            case "subtract":
                damage.value = damage.base - attribute.value;
                break;
            case "multiply":
                damage.value = damage.base * attribute.value;
                break;
            case "divide":
                damage.value = damage.base / attribute.value;
        }

        // Rather reduce damage to the next full decimal.
        damage.value = Math.floor(damage.value);
        damage.value = Helpers.applyValueRange(damage.value, {min: 0});

        return damage;
    }
}