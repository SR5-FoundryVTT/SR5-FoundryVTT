import {SR5Actor} from "../SR5Actor";
import {Helpers} from "../../helpers";
import InventoryData = Shadowrun.InventoryData;
import InventoriesData = Shadowrun.InventoriesData;
import {SR5Item} from "../../item/SR5Item";


/**
 * Handle all inventory related actions on an SR5Actor'.
 *
 * An inventory can store a set of items on a document, without actually altering the
 * itemData directly, only going through the documentData and indirectly referencing the item.
 *
 * It expects the document to define a defaultInventory field of type InventoryData, which
 * is where all items without an inventory will be placed. This default inventory won't be
 * stored on the document. This allows for the inventory system to be drop in, without any
 * migration needed.
 */
export class InventoryFlow {
    document: SR5Actor;

    constructor(document: SR5Actor) {
        //@ts-ignore // TODO: foundry-vtt-types v10
        if (document.system.inventories === undefined)
            console.error('Shawdorun 5e | Actor given does not have a inventory data structure. You will experience bugs.');

        this.document = document;
    }

    /**
     * Create an inventory place for gear organization.
     *
     * @param name How to name the inventory, will also be its label for custom inventories.
     */
    async create(name: string) {
        console.log(`Shadowrun 5e | Creating inventory ${name}`);

        if (this.exists(name)) return ui.notifications?.warn(game.i18n.localize('SR5.Errors.InventoryAlreadyExists'));
        if (this.document.defaultInventory.name === name) return;

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
        return await this.document.update(updateData, {render: false})
    }

    /**
     * Remove an actors inventory and maybe move the containing items over to another one.
     *
     * @param name The inventory name to be removed.
     * @param moveTo The inventory name items need to moved over to, otherwise the default inventory.
     */
    async remove(name: string, moveTo: string = this.document.defaultInventory.name) {
        console.log(`Shadowrun 5e | Removing inventory ${name}. Moving items over to ${moveTo}`);

        if (this.document.defaultInventory.name === name)
            return ui.notifications?.error(game.i18n.localize('SR5.Errors.DefaultInventoryCantBeRemoved'));

        if (!this.exists(name))
            return console.error(`Shadowrun 5e | Can't remove inventory ${name} or move its items over to inventory ${moveTo}`);

        // Move items over to default in case of missing target inventory.
        if (!this.exists(moveTo))
            moveTo = this.document.defaultInventory.name;

        // Prepare deletion of inventory.
        const updateData = Helpers.getDeleteKeyUpdateData('system.inventories', name);

        // Default inventory is virtual, so only none default inventories need to have their items merged.
        if (this.document.defaultInventory.name !== moveTo) {
            // @ts-ignore
            updateData[`system.inventories.${moveTo}.itemIds`] = [
                //@ts-ignore // TODO: foundry-vtt-types v10
                ...this.document.system.inventories[name].itemIds,
                //@ts-ignore // TODO: foundry-vtt-types v10
                ...this.document.system.inventories[moveTo].itemIds
            ];
        }

        console.log(`Shadowrun 5e | Executing update to remove inventory`, updateData);
        // Don't render to allow sheets to manage switching inventories.
        await this.document.update(updateData, {render: false});
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
        return name === Object.keys(this.document.system.inventories)
                              .find(inventory => inventory.toLowerCase() === name.toLowerCase());
    }

    /**
     * Helper to get a specifics inventory's data
     *
     * @param name The inventory name to return.
     */
    getOne(name): InventoryData | undefined {
        //@ts-ignore // TODO: foundry-vtt-types v10
        return this.document.system.inventories[name];
    }

    /**
     * Helper to get all inventories.
     */
    getAll(): InventoriesData {
        //@ts-ignore // TODO: foundry-vtt-types v10
        return this.document.system.inventories;
    }

    /**
     * Rename an existing inventory to a new name.
     *
     * @param current The old name of the inventory.
     * @param newName The new name of the inventory.
     */
    async rename(current: string, newName: string) {
        console.log(`Shadowrun 5e | Renaming the inventory ${current} to ${newName}`);

        if (this.document.defaultInventory.name === current) return;
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
        await this.document.update(updateData, {render: false});
    }

    /**
     * Add an array of items to the given inventory.
     *
     * @param name The inventory to add the items to.
     * @param items The items in question. A single item can be given.
     * @param removeFromCurrent By default the item added will be removed from another inventory it might be in.
     */
    async addItems(name: string, items: SR5Item[] | SR5Item, removeFromCurrent: boolean = true) {
        console.log(`Shadowrun 5e | Adding items to to inventory ${name}`, items);

        // Default inventory is valid target here.
        if (this.document.defaultInventory.name !== name && !this.exists(name)) return;
        if (items instanceof SR5Item) items = [items];
        if (items.length === 0) return;

        if (removeFromCurrent) {
            // This will cause at least one additional re-render, but make the code clearer.
            for (const item of items) await this.removeItem(item);
        }

        // Default inventory is no actual inventory that needs to be added to.
        if (this.document.defaultInventory.name === name) return;

        for (const item of items) {
            //@ts-ignore // TODO: foundry-vtt-types v10
            if (item.id) this.document.system.inventories[name].itemIds.push(item.id);
        }

        //@ts-ignore // TODO: foundry-vtt-types v10
        const updateData = {[`system.inventories.${name}.itemIds`]: this.document.system.inventories[name].itemIds};

        console.log(`Shadowrun 5e | Executing adding items to inventory`, updateData);
        await this.document.update(updateData);
    }

     /**
     * Remove the given item from one or any inventory it might be in.
     *
     * @param item The item to be removed.
     * @param name The one inventory to remove it from. If empty, will search for inventory the item is in.
     */
    async removeItem(item: SR5Item, name?: string) {
        console.log(`Shadowrun 5e | Removing item from inventory (${name || this.document.defaultInventory.name})`, item);

        // The default inventory is not actual inventory.
        if (this.document.defaultInventory.name === name) return;

        // Collect affected inventories.
        //@ts-ignore // TODO: foundry-vtt-types v10
        const inventories: InventoryData[] = name ?
            //@ts-ignore // TODO: foundry-vtt-types v10
            [this.document.system.inventories[name]] :
            //@ts-ignore // TODO: foundry-vtt-types v10
            Object.values(this.document.system.inventories).filter(({itemIds}) => itemIds.includes(item.id as string));

        // No inventory found means, it's in the default inventory and no removal is needed.
        if (inventories.length === 0) return;

        // Collect all inventories with remaining ids after the item's been removed.
        const updateData = {};
        for (const inventory of inventories) {
            const itemIds = inventory.itemIds.filter(id => id !== item.id);
            updateData[`system.inventories.${inventory.name}.itemIds`] = itemIds;
        }

        console.log(`Shadowrun 5e | Executing update to remove item`, updateData);
        if (updateData) await this.document.update(updateData);
    }
}