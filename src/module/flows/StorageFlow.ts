import { MatrixNetworkFlow } from '@/module/item/flows/MatrixNetworkFlow';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { ItemMarksFlow } from '@/module/item/flows/ItemMarksFlow';
import { MarksStorage } from '@/module/storage/MarksStorage';
import { RiggerFlow } from '@/module/flows/RiggerFlow';
import { SYSTEM_NAME } from '@/module/constants';

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
        try {
            await ItemMarksFlow.handleOnDeleteItem(item);
        } catch (e) {
            console.warn('SR5 | Failed to delete item marks references', e);
        }
        try {
            await MatrixNetworkFlow.handleOnDeleteDocument(item);
        } catch (e) {
            console.warn('SR5 | Failed to delete item network references', e);
        }
    },

    /**
     * Delete references to an actor and all their owned items
     * @param actor
     */
    async _deleteStorageReferencesActor(actor: SR5Actor) {
        // If the actor being deleted has a lot of items, actor can take some time
        // display a progress bar of the items being "deleted" so the user knows something is happening at least
        const progressBar: any = ui.notifications?.info?.(`${actor.name} - ${game.i18n.localize("SR5.Notifications.DeletingStorageReferences.Start")}`, { progress: true });

        // If actor is a vehicle, handle jumping out driver and clearing driver link
        if (actor.isType('vehicle')) {
            const driver = actor.getVehicleDriver();
            if (driver) {
                try {
                    await RiggerFlow.jumpOut(driver, actor);
                } catch (e) {
                    console.warn('SR5 | Failed to jump out driver on vehicle delete', e);
                }
                try {
                    await actor.removeVehicleDriver();
                } catch (e) {
                    console.warn('SR5 | Failed to remove driver on vehicle delete', e);
                }
            }
        }

        // Clean up any jumpedIn flags referencing this actor
        for (const act of (game.actors?.contents || [])) {
            if (act.getFlag(SYSTEM_NAME, 'jumpedInVehicleUuid') === actor.uuid) {
                try {
                    await act.unsetFlag(SYSTEM_NAME, 'jumpedInVehicleUuid');
                    await act.unsetFlag(SYSTEM_NAME, 'jumpedInVehicle');
                    await act.toggleStatusEffect('sr5jumpedIn', { active: false });
                } catch (e) {
                    console.warn('SR5 | Failed to clear jumped-in flag on actor delete', e);
                }
            }
        }

        // if we have a matrix device, delete its storage references first, actor speeds up deleting their PAN
        try {
            await this.deleteStorageReferences(actor.getMatrixDevice());
        } catch (e) {
            console.warn('SR5 | Failed to delete matrix device storage references', e);
        }

        // when an actor is deleted, handle deleting all owned items
        let i = 0;
        const total = actor.items.size;
        for (const item of actor.items) {
            if (typeof progressBar?.update === 'function') {
                progressBar.update({
                    pct: i / total,
                    message: `(${i+1}/${total}) ${actor.name} - ${game.i18n.localize(`SR5.Notifications.DeletingStorageReferences.Item`)} ${item.name}`
                });
            }
            try {
                await this.deleteStorageReferences(item);
            } catch (e) {
                console.warn('SR5 | Failed to delete item storage references', e);
            }
            i++;
        }
        // display the progress bar at 100% while we finis cleaning up the actor
        if (typeof progressBar?.update === 'function') {
            progressBar.update({
                pct: 1,
                message: `${actor.name} - ${game.i18n.localize(`SR5.Notifications.DeletingStorageReferences.Finished`)}`,
            });
        }
        // handle our own actual deletion
        if (actor.uuid) {
            try {
                await MarksStorage.clearRelations(actor.uuid);
            } catch (e) {
                console.warn('SR5 | Failed to clear marks relations on delete', e);
            }
        }
        try {
            await MatrixNetworkFlow.handleOnDeleteDocument(actor);
        } catch (e) {
            console.warn('SR5 | Failed to handle network deletion for actor', e);
        }
        // remove the progress bar now, we don't need to keep it around
        if (typeof progressBar?.remove === 'function') {
            progressBar.remove();
        }
    }
}
