import { ActionRollType } from 'src/module/types/item/ActionModel';
import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';
import { SR5Item } from './../../SR5Item';
/**
 * Item data preparation around the 'action' template.json item template.
 */
export const ActionPrep = {
    /**
     * Main preparation method for actions prep.
     * @param action The ActionRollData to alter.
     * @param item The item to use as a source.
     * @param equippedMods Equipped modifications on that item.
     * @param equippedAmmo Equipped ammunition on that item.
     */
    prepareData(action: ActionRollType, item: SR5Item, equippedMods: SR5Item<'modification'>[], equippedAmmo?: SR5Item<'ammo'>) {
        ActionPrep.clearMods(action);
        ActionPrep.prepareDamageSource(action, item);
        ActionPrep.prepareWithMods(action, equippedMods);
        ActionPrep.prepareWithAmmo(action, equippedAmmo);
        ActionPrep.calculateValues(action);
    },
    /**
     * remove any possible previous mods that might have been introduced by preparation or alteration in system data.
     * 
     * @param action The ActionRollData to alter.
     */
    clearMods(action: ActionRollType) {
        action.alt_mod = 0;
        action.limit.mod = [];
        action.damage.mod = [];
        action.damage.ap.mod = [];
        action.dice_pool_mod = [];
    },

    /**
     * Provide the action damage a source for the damage calculation.
     * 
     * @param action The ActionRollData to alter.
     * @param item The item to use as a source.
     */
    prepareDamageSource(action: ActionRollType, item: SR5Item) {
        if (!item.actor?.system) return;

        action.damage.source = {
            actorId: item.actor.id as string,
            itemId: item.id as string,
            itemName: item.name as string,
            itemType: item.type
        };
    },

    /**
     * Prepare weapon action data effects of the quipped ammo item.
     * @param action The systems data action property to be altered.
     * @param equippedAmmo The equipped ammunition item
     */
    prepareWithAmmo(action: ActionRollType, equippedAmmo?: SR5Item<'ammo'>) {
        // No equipped ammo, just calculate the damage directly.
        if (!equippedAmmo) {            
            action.damage.element.value = action.damage.element.base;
            action.damage.type.value = action.damage.type.base;

            return;
        }

        // Collect weapon value modifications from used ammunition.
        const ammoData = equippedAmmo.system;
        const limitParts = new PartsList(action.limit.mod);

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

        // Apply collected modifications.
        action.limit.mod = limitParts.list;
    },

    /**
     * Prepare general action data.
     * 
     * This is used for all item type having actions and includes weapon value calculation as well.
     * 
     * @param action The systems data action property to be altered.
     * @param equippedMods Those item mods that are equipped
     */
    prepareWithMods(action: ActionRollType, equippedMods: SR5Item[]) {
        // Collect weapon value modifications from modifications.
        const limitParts = new PartsList(action.limit.mod);
        const dpParts = new PartsList(action.dice_pool_mod);
        equippedMods.forEach((mod) => {
            const modification = mod.asType('modification');
            if (!modification) return;

            if (modification.system.accuracy) limitParts.addUniquePart(mod.name as string, modification.system.accuracy);
            if (modification.system.dice_pool) dpParts.addUniquePart(mod.name as string, modification.system.dice_pool);
        });

        // Apply collected modifications.
        action.limit.mod = limitParts.list;
        action.dice_pool_mod = dpParts.list;
    },

    /**
     * Calculate the total values of action data.
     * 
     * @param action To be altered action data.
     */
    calculateValues(action: ActionRollType) {
        action.damage.value = Helpers.calcTotal(action.damage);
        action.damage.ap.value = Helpers.calcTotal(action.damage.ap);
        action.limit.value = Helpers.calcTotal(action.limit);
    }
}