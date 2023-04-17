import {SR5Actor} from "../SR5Actor";
import {Helpers} from "../../helpers";
import InventoryData = Shadowrun.InventoryData;
import InventoriesData = Shadowrun.InventoriesData;
import {SR5Item} from "../../item/SR5Item";


/**
 * Handle all inventory related actions on an SR5Actor'.
 *
 * An inventory can store a set of items on an actor, without actually altering the
 * itemData directly, only going through the documentData and indirectly referencing the item.
 *
 * It expects the actor to define a defaultInventory field of type InventoryData, which
 * is where all items without an inventory will be placed. This default inventory won't be
 * stored on the actor. This allows for the inventory system to be drop in, without any
 * migration needed.
 * 
 * Furthermore a default Inventory (actor.allInventories) exists on all inventory actors
 * that has showAll set to true. An item can either be on no inventory, one custom inventory
 * or this allInventories, which will let it appear on all inventories.
 */
export class InventoryFlow {
    actor: SR5Actor;

    constructor(actor: SR5Actor) {
        //@ts-ignore // TODO: foundry-vtt-types v10
        if (actor.system.inventories === undefined)
            console.error('Shawdorun 5e | Actor given does not have a inventory data structure. You will experience bugs.');

        this.actor = actor;
    }

    /**
     * Create an inventory place for gear organization.
     *
     * @param name How to name the inventory, will also be its label for custom inventories.
     * @returns Created inventories name
     */
    async create(name: string): Promise<string|void> {
        console.log(`Shadowrun 5e | Creating inventory ${name}`);

        name = InventoryFlow._sanitzeName(name);

        if (name.length === 0) return console.error('Shadowrun 5e | The given name has been reduced to a zero length, please try another name');
        if (this.exists(name)) return ui.notifications?.warn(game.i18n.localize('SR5.Errors.InventoryAlreadyExists'));
        if (this.actor.defaultInventory.name === name) return;

        const updateData = {
            'system.inventories': {
                [name]: {
                    name,
                    label: name,
                    itemIds: []
                }
            }
        };

        console.log(`Shadowrun 5e | Executing update to create inventory`, updateData)
        // Don't render to allow sheets to manage switching inventories.
        await this.actor.update(updateData, {render: false});

        return name;
    }

    /**
     * Remove an actors inventory and maybe move the containing items over to another one.
     *
     * @param name The inventory name to be removed.
     * @param moveTo The inventory name items need to moved over to, otherwise the default inventory.
     */
    async remove(name: string, moveTo: string = this.actor.defaultInventory.name) {
        console.log(`Shadowrun 5e | Removing inventory ${name}. Moving items over to ${moveTo}`);

        if (this.disallowRemove(name))
            return ui.notifications?.error(game.i18n.localize('SR5.Errors.DefaultInventoryCantBeRemoved'));

        if (!this.exists(name))
            return console.error(`Shadowrun 5e | Can't remove inventory ${name} or move its items over to inventory ${moveTo}`);

        // Move items over to default in case of missing target inventory.
        if (!this.exists(moveTo))
            moveTo = this.actor.defaultInventory.name;

        // Prepare deletion of inventory.
        const updateData = Helpers.getDeleteKeyUpdateData('system.inventories', name);

        // Default inventory is virtual, so only none default inventories need to have their items merged.
        if (this.actor.defaultInventory.name !== moveTo) {
            // @ts-ignore
            updateData[`system.inventories.${moveTo}.itemIds`] = [
                //@ts-ignore // TODO: foundry-vtt-types v10
                ...this.actor.system.inventories[name].itemIds,
                //@ts-ignore // TODO: foundry-vtt-types v10
                ...this.actor.system.inventories[moveTo].itemIds
            ];
        }

        console.log(`Shadowrun 5e | Executing update to remove inventory`, updateData);
        // Don't render to allow sheets to manage switching inventories.
        await this.actor.update(updateData, {render: false});
    }

        /**
     * Does this actor have the given inventory already?
     *
     * Note: Comparisons will only be against lower case.
     *
     * @param name The inventory name.
     */
    exists(name): boolean {
        //@ts-ignore // TODO: foundry-vtt-types v10
        return name === Object.keys(this.actor.system.inventories)
                            .find(inventory => inventory.toLowerCase() === name.toLowerCase());
    }

    /**
     * Helper to get a specifics inventory's data
     *
     * @param name The inventory name to return.
     */
    getOne(name): InventoryData | undefined {
        //@ts-ignore // TODO: foundry-vtt-types v10
        return this.actor.system.inventories[name];
    }

    /**
     * Helper to get all inventories.
     */
    getAll(): InventoriesData {
        //@ts-ignore // TODO: foundry-vtt-types v10
        return this.actor.system.inventories;
    }

    /**
     * Rename an existing inventory to a new name.
     *
     * @param current The old name of the inventory.
     * @param newName The new name of the inventory.
     */
    async rename(current: string, newName: string): Promise<string|void> {
        console.log(`Shadowrun 5e | Renaming the inventory ${current} to ${newName}`);

        // Disallow editing of default inventory.
        if (this.disallowRename(current))
            return ui.notifications?.warn(game.i18n.localize('SR5.Warnings.CantEditDefaultInventory'));

        newName = InventoryFlow._sanitzeName(newName);

        if (newName.length === 0) return console.error('Shadowrun 5e | The given name has been reduced to a zero length, please try another name');
        if (this.actor.defaultInventory.name === current) return;
        if (current === newName) return;

        const inventory = this.getOne(current);
        if (!inventory) return;

        // Change internal and display name.
        inventory.name = newName;
        inventory.label = newName;

        const updateData = {
            'system.inventories': {
                [`-=${current}`]: null,
                [newName]:  inventory
            }
        };

        console.log(`Shadowrun 5e | Executing update to rename inventory`, updateData);
        // Don't render to allow sheets to manage switching inventories.
        await this.actor.update(updateData, {render: false});

        return newName;
    }

    /**
     * Add an array of items to the given inventory.
     *
     * @param inventoryName The inventory to add the items to.
     * @param items The items in question. A single item can be given.
     * @param removeFromCurrent By default the item added will be removed from another inventory it might be in.
     */
    async addItems(inventoryName: string, items: SR5Item[] | SR5Item, removeFromCurrent: boolean = true) {
        console.log(`Shadowrun 5e | Adding items to to inventory ${inventoryName}`, items);

        // Default inventory is valid target here.
        if (this.actor.defaultInventory.name !== inventoryName && !this.exists(inventoryName)) return;
        if (items instanceof SR5Item) items = [items];
        if (items.length === 0) return;

        if (removeFromCurrent) {
            // This will cause at least one additional re-render, but make the code clearer.
            for (const item of items) await this.removeItem(item);
        }

        // Default inventory is no actual inventory that needs to be added to.
        if (this.actor.defaultInventory.name === inventoryName) return;

        for (const item of items) {
            //@ts-ignore // TODO: foundry-vtt-types v10
            if (item.id) this.actor.system.inventories[inventoryName].itemIds.push(item.id);
        }

        //@ts-ignore // TODO: foundry-vtt-types v10
        const updateData = {[`system.inventories.${inventoryName}.itemIds`]: this.actor.system.inventories[inventoryName].itemIds};

        console.log(`Shadowrun 5e | Executing adding items to inventory`, updateData);
        await this.actor.update(updateData);
    }

     /**
     * Remove the given item from one or any inventory it might be in.
     *
     * @param item The item to be removed.
     * @param name The one inventory to remove it from. If empty, will search for inventory the item is in.
     */
    async removeItem(item: SR5Item, name?: string) {
        console.log(`Shadowrun 5e | Removing item from inventory (${name || this.actor.defaultInventory.name})`, item);

        // The default inventory is not actual inventory.
        if (this.actor.defaultInventory.name === name) return;

        // Collect affected inventories.
        //@ts-ignore // TODO: foundry-vtt-types v10
        const inventories: InventoryData[] = name ?
            //@ts-ignore // TODO: foundry-vtt-types v10
            [this.actor.system.inventories[name]] :
            //@ts-ignore // TODO: foundry-vtt-types v10
            Object.values(this.actor.system.inventories).filter(({itemIds}) => itemIds.includes(item.id as string));

        // No inventory found means, it's in the default inventory and no removal is needed.
        if (inventories.length === 0) return;

        // Collect all inventories with remaining ids after the item's been removed.
        const updateData = {};
        for (const inventory of inventories) {
            const itemIds = inventory.itemIds.filter(id => id !== item.id);
            updateData[`system.inventories.${inventory.name}.itemIds`] = itemIds;
        }

        console.log(`Shadowrun 5e | Executing update to remove item`, updateData);
        if (updateData) await this.actor.update(updateData);
    }

    /**
     * Sanitize inventory name to not use characters used within FoundryVTT Document#update and expandObject methods.
     * 
     * @param name The inventory name, maybe containing prohibited characters
     */
    static _sanitzeName(name: string): string {
        return Helpers.sanitizeDataKey(name);
    }

    /**
     * Check if a rename would be allowed
     * @param name The current name of the to be renamed invenotry
     * @returns true, when it's not and false when it is.
     */
    disallowRename(name: string): boolean {
        // Sanitize falsy by disallowing
        if (!name) return true;
        return [this.actor.defaultInventory.name, this.actor.allInventories.name].includes(name);
    }

    /**
     * Check if a remove would be allowed.
     * 
     * @param name The current name of the to be removed invenotry
     * @returns true, when it's not and false when it is.
     */
    disallowRemove(name: string): boolean {
        // Sanitize falsy by disallowing
        if (!name) return true;
        return [this.actor.defaultInventory.name, this.actor.allInventories.name].includes(name);
    }
}