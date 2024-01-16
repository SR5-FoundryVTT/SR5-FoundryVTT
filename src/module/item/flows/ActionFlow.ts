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
import { SR5 } from "../../config";

export class ActionFlow {
    /**
     * Calculate action damage configuration based on flat damage field and possible dynamic attribute modification.
     *
     * @param damage The damage field as defined within the ActionData
     * @param actor The actor to use should a dynamic calculation be needed.
     * @param item
     */
    static calcDamageData(damage: DamageData, actor?: SR5Actor, item?: SR5Item): DamageData {
        // Avoid manipulation on original data, which might come from database values.
        damage = foundry.utils.duplicate(damage);

        if (!actor) return damage;

        if (item) {
            damage.source = ActionFlow._damageSource(actor, item);
        }

        this._applyModifiableValue(damage, actor);
        damage.value = Helpers.calcTotal(damage, {min: 0});

        this._applyModifiableValue(damage.ap, actor);
        damage.ap.value = Helpers.calcTotal(damage.ap, {min: 0});

        return damage;
    }

    static _applyModifiableValue(value: Shadowrun.ModifiableValueLinked, actor: SR5Actor) {
        const attribute = actor.findAttribute(value.attribute);
        if (!attribute) return;

        if (!value.base_formula_operator) {
            console.error(`Unsupported formula operator: '${value.base_formula_operator}' used. Falling back to 'add'.`);
            value.base_formula_operator = 'add';
        }

        // Avoid altering base OR value fields and raising the resulting damage on multiple function calls.
        switch (value.base_formula_operator) {
            case "add":
                PartsList.AddUniquePart(value.mod, attribute.label, attribute.value);
                break;
            case "subtract":
                PartsList.AddUniquePart(value.mod, attribute.label, -attribute.value);
                break;
            case "multiply":
                PartsList.AddUniquePart(value.mod, 'SR5.Value', (value.base * attribute.value) - value.base);
                break;
            case "divide":
                // Remove base from value by modifying.
                PartsList.AddUniquePart(value.mod, 'SR5.BaseValue', value.base * -1);
                // Add division result as modifier on zero.
                const denominator = attribute.value === 0 ? 1 : attribute.value;
                PartsList.AddUniquePart(value.mod, 'SR5.Value', Math.floor(value.base / denominator));
                break;
        }
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

    /**
     * Collect all active skills either from global context or from within a given document.
     * 
     * @param actor An optional actor to retrieve skills from (including custom skills)
     * @returns Sorted list of skills for sheet usage.
     */
    static sortedActiveSkills(actor?: SR5Actor) {
        // Fallback for actors without skills.
        if (!actor || actor.isIC()) return Helpers.sortConfigValuesByTranslation(SR5.activeSkills);

        // Normalize custom and legacy skills to a single format.
        // Legacy skills have no name, but use their name as id.
        // Custom skills have a name but their id is random.
        const normalizedSkills: Record<string, string> = {};
        const skills = Helpers.sortSkills(actor.getActiveSkills());
        for (const [id, skill] of Object.entries(skills)) {
            const key = skill.name || id;
            const label = skill.label || skill.name;
            normalizedSkills[key] = label;
        }

        return normalizedSkills;
    }
}