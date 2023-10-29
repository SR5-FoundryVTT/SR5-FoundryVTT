import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';
import { SR5Item } from './../../SR5Item';
/**
 * Item data preparation around the 'action' template.json item template.
 */
export const ActionPrep = {
    /**
     * Provide the action damage a source for the damage calculation.
     * 
     * @param action The ActionRollData to alter.
     * @param item The item to use as a source.
     */
    prepareActionDamageSource(action: Shadowrun.ActionRollData, item: SR5Item) {
        if (!item.actor?.system) return;

        action.damage.source = {
            actorId: item.actor.id as string,
            itemId: item.id as string,
            itemName: item.name as string,
            itemType: item.type
        };
    },
    /**
     * Prepare general action data.
     * 
     * This is used for all item type having actions and includes weapon value calculation as well.
     * 
     * @param action The systems data action property to be altered.
     * @param equippedMods Those item mods that are equipped
     * @param equippedAmmo The equipped ammunition item
     */
    prepareActionRollData(action: Shadowrun.ActionRollData, equippedMods: SR5Item[], equippedAmmo?: SR5Item) {
        action.alt_mod = 0;
        action.limit.mod = [];
        action.damage.mod = [];
        action.damage.ap.mod = [];
        action.dice_pool_mod = [];

        // @ts-expect-error
        // Due to faulty template value items without a set operator will have a operator literal instead since 0.7.10.
        if (action.damage.base_formula_operator === '+') {
            action.damage.base_formula_operator = 'add';
        }

        // Collect weapon value modifications from modifications.
        const limitParts = new PartsList(action.limit.mod);
        const dpParts = new PartsList(action.dice_pool_mod);
        equippedMods.forEach((mod) => {
            const modification = mod.asModification();
            if (!modification) return;

            if (modification.system.accuracy) limitParts.addUniquePart(mod.name as string, modification.system.accuracy);
            if (modification.system.dice_pool) dpParts.addUniquePart(mod.name as string, modification.system.dice_pool);
        });

        // Collect weapon value modifications from used ammunition.
        if (equippedAmmo) {
            //@ts-expect-error // TODO: foundry-vtt-types v10 
            const ammoData = equippedAmmo.system as AmmoData;

            // Some ammunition want to replace the weapons damage, others modify it.
            if (ammoData.replaceDamage) {
                action.damage.override = { name: equippedAmmo.name as string, value: Number(ammoData.damage) };
            } else {
                action.damage.mod = PartsList.AddUniquePart(action.damage.mod, equippedAmmo.name as string, ammoData.damage);
            }

            // add mods to ap from ammo
            action.damage.ap.mod = PartsList.AddUniquePart(action.damage.ap.mod, equippedAmmo.name as string, ammoData.ap);

            if (ammoData.accuracy) limitParts.addUniquePart(equippedAmmo.name as string, ammoData.accuracy);

            // override element
            if (ammoData.element) {
                action.damage.element.value = ammoData.element;
            } else {
                action.damage.element.value = action.damage.element.base;
            }

            // override damage type
            if (ammoData.damageType) {
                action.damage.type.value = ammoData.damageType;
            } else {
                action.damage.type.value = action.damage.type.base;
            }
        } else {
            // set value if we don't have item overrides
            action.damage.element.value = action.damage.element.base;
            action.damage.type.value = action.damage.type.base;
        }

        // Apply collected modifications.
        action.limit.mod = limitParts.list;
        action.dice_pool_mod = dpParts.list;

        // once all damage mods have been accounted for, sum base and mod to value
        action.damage.value = Helpers.calcTotal(action.damage);
        action.damage.ap.value = Helpers.calcTotal(action.damage.ap);
        action.limit.value = Helpers.calcTotal(action.limit);
    }
}