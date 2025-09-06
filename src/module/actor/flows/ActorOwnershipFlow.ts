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
     * @param uuid - uuid of the instance to check
     */
    async isOwnerOf(actor: SR5Actor, uuid: string): Promise<boolean> {
        const device = await fromUuid(uuid) as any;
        if (!device) return false;
        if (device instanceof SR5Item) {
            // check if we are the actorOwner of the item
            return device.actorOwner === actor;
        } else if (device instanceof SR5Actor) {
            if (device === actor) return true;
            // if it's a vehicle, check if we are the driver of it (this isn't perfect but will do for now)
            const vehicle = device.asType('vehicle');
            if (vehicle && vehicle.getVehicleDriver() === actor) return true;
        }
        return false;
    }

}
