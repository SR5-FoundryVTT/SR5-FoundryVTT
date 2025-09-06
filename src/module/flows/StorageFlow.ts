import { MatrixNetworkFlow } from '@/module/item/flows/MatrixNetworkFlow';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { ItemMarksFlow } from '@/module/item/flows/ItemMarksFlow';

/**
 * Storage Flow Handles global storage changes when an actor or item is deleted
 * - this should be expanded as we introduce more global storage
 */
export const StorageFlow = {

    /**
     * Delete References to an actor or item in the Global Storage areas
     */
    async deleteStorageReferences(document: SR5Actor | SR5Item | null | undefined) {
        if (document instanceof SR5Actor) return this._deleteStorageReferencesActor(document);
        else if (document instanceof SR5Item) return this._deleteStorageReferencesItem(document);
    },

    /**
     * Delete references to items in storage
     * @param item
     */
    async _deleteStorageReferencesItem(item: SR5Item) {
        await ItemMarksFlow.handleOnDeleteItem(item);
        await MatrixNetworkFlow.handleOnDeleteDocument(item);
    },

    /**
     * Delete references to an actor and all their owned items
     * @param actor
     */
    async _deleteStorageReferencesActor(actor: SR5Actor) {
        // If the actor being deleted has a lot of items, actor can take some time
        // display a progress bar of the items being "deleted" so the user knows something is happening at least
        const progressBar = ui.notifications.info(`${actor.name} - ${game.i18n.localize("SR5.Notifications.DeletingStorageReferences.Start")}`, { progress: true });

        // if we have a matrix device, delete its storage references first, actor speeds up deleting their PAN
        await this.deleteStorageReferences(actor.getMatrixDevice());
        // when an actor is deleted, handle deleting all owned items
        let i = 0;
        const total = actor.items.size;
        for (const item of actor.items) {
            progressBar.update({
                pct: i / total,
                message: `(${i+1}/${total}) ${actor.name} - ${game.i18n.localize(`SR5.Notifications.DeletingStorageReferences.Item`)} ${item.name}`
            })
            await this.deleteStorageReferences(item);
            i++;
        }
        // display the progress bar at 100% while we finis cleaning up the actor
        progressBar.update({
            pct: 1,
            message: `${actor.name} - ${game.i18n.localize(`SR5.Notifications.DeletingStorageReferences.Finished`)}`,
        });
        // handle our own actual deletion
        await MatrixNetworkFlow.handleOnDeleteDocument(actor);
        // remove the progress bar now, we don't need to keep it around
        progressBar.remove();
    }
}
