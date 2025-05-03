/**
 * Handle all things related to the action template (template.json)
 */
import { SR5Actor } from "../../actor/SR5Actor";
import { Helpers } from "../../helpers";
import { SR5Item } from "../SR5Item";
import { PartsList } from "../../parts/PartsList";
import { SR5 } from "../../config";
import { DataDefaults } from "../../data/DataDefaults";
import { Translation } from "../../utils/strings";

export class ActionFlow {
    /**
     * Calculate action damage configuration based on flat damage field and possible dynamic attribute modification.
     *
     * @param damage The damage field as defined within the ActionData
     * @param actor The actor to use should a dynamic calculation be needed.
     * @param item
     */
    static calcDamageData(damage: Shadowrun.DamageData, actor?: SR5Actor, item?: SR5Item): Shadowrun.DamageData {
        // Avoid manipulation on original data, which might come from database values.
        damage = foundry.utils.duplicate(damage);

        if (!actor) return damage;

        if (item) {
            damage.source = ActionFlow._damageSource(actor, item);
        }

        this._applyModifiableValue(damage, actor);
        damage.value = Helpers.calcTotal(damage, { min: 0 });

        this._applyModifiableValue(damage.ap, actor);
        damage.ap.value = Helpers.calcTotal(damage.ap, { min: 0 });

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
    static _damageSource(actor: SR5Actor, item: SR5Item): Shadowrun.DamageSource {
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
     * @param damage Any Shadowrun.DamageData taken from an template action section
     * 
     * @returns true, when the user configured damage contains any parts.
     */
    static hasDamage(damage: Shadowrun.DamageData): boolean {
        if (damage.base !== 0) return true;
        if (damage.attribute) return true;
        if (damage.type) return true;
        if (damage.element) return true;

        return false;
    }

    /**
     * Collect all active skills either from global context or from within a given document.
     *
     * Normalize custom and legacy skills to a single format.
     * Legacy skills have no name, but use their name as id.
     * Custom skills have a name but their id is random.
     * 
     * @param actor An optional actor to retrieve skills from (including custom skills)
     * @param skillNames An optional list of skills that should be included in the selection, even if it's missing from the global list.
     * @returns Sorted list of skills with a name : label key-value structure for select elements on sheets.
     */
    static sortedActiveSkills(actor?: SR5Actor, skillNames?: string[]) {
        // CASE - Return default skills whenn no local actor skills are used.
        //        The major use case is the sidebar item creation, where no actor is available.
        if (!actor || actor.isIC()) {
            // Inject this items custom skill into the global skill list.
            const globalSkills = foundry.utils.deepClone(SR5.activeSkills);
            skillNames?.forEach(skillName => { ActionFlow._injectMissingCustomSkill(globalSkills, skillName) });
            return Helpers.sortConfigValuesByTranslation(globalSkills);
        }

        // CASE - Return actor skills when available.
        //        the major use case is owned items, where the actor is available.
        const activeSkills = actor.getActiveSkills();

        // Convert skill data to a value label mapping.
        const skills: Record<string, Translation> = {};
        for (const [id, skill] of Object.entries(activeSkills)) {
            const key = skill.name || id;
            const label = skill.label || skill.name;
            skills[key] = label as Translation;
        }

        skillNames?.forEach(skillName => { ActionFlow._injectMissingCustomSkill(skills, skillName) });
        return Helpers.sortConfigValuesByTranslation(skills);
    }

    /**
     * Insert the given skill as a default skill in case it's missing.
     * 
     * This is needed for sidebar items, that don´t have local custom skills like owned items, to still
     * show the custom skill in the sill selection.
     *  
     * @param skills The set of active skills to be used.
     * @param skillName The skill name to be injected.
     */
    static _injectMissingCustomSkill(skills: Record<string, Translation>, skillName?: string) {
        if (!skillName) return;

        const foundCustomSkill = Object.values(skills).some(name => name === skillName);
        if (foundCustomSkill) return;
        if (skillName && !skills[skillName]) skills[skillName] = skillName as Translation;
    }
}