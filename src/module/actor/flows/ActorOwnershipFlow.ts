import { SR5Item } from '@/module/item/SR5Item';
import { SR5Actor } from '@/module/actor/SR5Actor';

/**
 * ActorOwnershipFlow should handle the Ownership of items by actors
 * - This works off of foundry ownership
 */
export const ActorOwnershipFlow = {

    /**
     * Determine if this actor is the owner of the given UUID
     * - this will check for items and for actors in the case of Vehicles/Drones
     * @param actor
     * @param uuid - uuid of the instance to check
     */
    async isOwnerOf(actor: SR5Actor, uuid: string): Promise<boolean> {
        const device = await fromUuid(uuid) as any;
        if (!device) return false;
        if (device instanceof SR5Item) {
            return this._isOwnerOfItem(actor, device);
        } else if (device instanceof SR5Actor) {
            return this._isOwnerOfActor(actor, device);
        }
        return false;
    },

    _isOwnerOfItem(actor: SR5Actor, device: SR5Item) {
        // check if we are the actorOwner of the item
        return device.actorOwner === actor;
    },

    _isOwnerOfActor(actor: SR5Actor, device: SR5Actor) {
        if (device === actor) return true;
        // if it's a vehicle, check if we are the driver of it (this isn't perfect but will do for now)
        const vehicle = device.asType('vehicle');
        if (vehicle) {
            return vehicle.getVehicleDriver() === actor;
        }
        const sprite = device.asType('sprite');
        if (sprite) {
            return sprite.getTechnomancer() === actor;
        }
        return false;
    }

}
