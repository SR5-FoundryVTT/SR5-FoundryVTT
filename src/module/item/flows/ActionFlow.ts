/**
 * Handle all things related to the action template (template.json)
 */
import {SR5Actor} from "../../actor/SR5Actor";
import DamageData = Shadowrun.DamageData;
import {Helpers} from "../../helpers";
import FormulaOperator = Shadowrun.FormulaOperator;
import {SR5Item} from "../SR5Item";
import DamageSource = Shadowrun.DamageSource;
import LimitField = Shadowrun.LimitField;
import ValueField = Shadowrun.ValueField;
import {PartsList} from "../../parts/PartsList";

export class ActionFlow {
    /**
     * Calculate action damage configuration based on flat damage field and possible dynamic attribute modification.
     *
     * @param damage The damage field as defined within the ActionData
     * @param actor The actor to use should a dynamic calculation be needed.
     * @param item
     */
    static calcDamage(damage: DamageData, actor?: SR5Actor, item?: SR5Item): DamageData {
        // Avoid manipulation on original data, which might come from database values.
        damage = duplicate(damage);

        if (!actor) return damage;

        if (item) {
            damage.source = ActionFlow._damageSource(actor, item);
        }

        const attribute = actor.findAttribute(damage.attribute);
        if (!attribute) return damage;

        if (!damage.base_formula_operator) {
            console.error(`Unsupported base damage formula operator: '${damage.base_formula_operator}' used. Falling back to 'add'.`);
            damage.base_formula_operator = 'add';
        }

        // Avoid altering base OR value fields and raising the resulting damage on multiple function calls.
        switch (damage.base_formula_operator) {
            case "add":
                PartsList.AddUniquePart(damage.mod, attribute.label, attribute.value);
                break;
            case "subtract":
                PartsList.AddUniquePart(damage.mod, attribute.label, -attribute.value);
                break;
            case "multiply":
                PartsList.AddUniquePart(damage.mod, 'SR5.Value', (damage.base * attribute.value) - damage.base);
                break;
            case "divide":
                // Remove base from value by modifying.
                PartsList.AddUniquePart(damage.mod, 'SR5.BaseValue', damage.base * -1);
                // Add division result as modifier on zero.
                const denominator = attribute.value === 0 ? 1 : attribute.value;
                PartsList.AddUniquePart(damage.mod, 'SR5.Value', Math.floor(damage.base / denominator));
                break;
        }

        damage.value = Helpers.calcTotal(damage, {min: 0});

        return damage;
    }

    /**
     * Damage that's caused by an item can later be used to determine how that damage should be applied
     *
     * @param actor The actor used to determine damage
     * @param item The item from which damage's been determined from.
     */
    static _damageSource(actor: SR5Actor, item: SR5Item): DamageSource {
        return {
            actorId: actor.id || '',
            itemId: item.id || '',
            itemName: item.name || '',
            itemType: item.type
        }
    }

    /**
     * Does an action based damage contain any damaging content.
     * 
     * @param damage Any DamageData taken from an template action section
     * 
     * @returns true, when the user configured damage contains any parts.
     */
    static hasDamage(damage: DamageData): boolean {
        if (damage.base !== 0) return true;
        if (damage.attribute) return true;
        if (damage.type) return true;
        if (damage.element) return true;

        return false;
    }
}