/**
 * Handle all things related to the action template (template.json)
 */
import {SR5Actor} from "../../actor/SR5Actor";
import DamageData = Shadowrun.DamageData;
import {Helpers} from "../../helpers";
import FormulaOperator = Shadowrun.FormulaOperator;

export class ActionFlow {
    /**
     * Calculate action damage configuration based on flat damage field and possible dynamic attribute modification.
     *
     * @param damage The damage field as defined within the ActionData
     * @param actor The actor to use should a dynamic calculation be needed.
     */
    static calcDamage(damage: DamageData, actor: SR5Actor|undefined): DamageData {
        // Avoid manipulation on original data, which might come from database values.
        damage = duplicate(damage) as DamageData;

        if (!actor) return damage;

        const attribute = actor.findAttribute(damage.attribute);
        if (!attribute) return damage;

        damage.base = ActionFlow._applyFormulaOperatorToValues(damage.base, attribute.value, damage.base_formula_operator);

        // Rather reduce damage to the next full decimal.
        damage.base = Helpers.applyValueRange(Math.floor(damage.base), {min: 0});
        damage.value = damage.base;

        return damage;
    }

    /** Calculate the result of operating on two values with basic formula operators.
     *
     * @param base The basic value operated opon.
     * @param value The value doing the operation with. If order is important, this value will be after the operator.
     * @param operator A formula operator (basic) to be used within a simple calculation.
     */
    static _applyFormulaOperatorToValues(base: number, value: number, operator:FormulaOperator): number {
        switch (operator) {
            case "add":
                return base + value;
            case "subtract":
                return base - value;
            case "multiply":
                return base * value;
            case "divide":
                return base / value;
            default:
                console.error(`Unsupported base damage formula operator: '${operator}' used. Falling back to 'add'.`);
                return base + value;
        }
    }
}