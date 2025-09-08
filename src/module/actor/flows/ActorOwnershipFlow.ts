import { SR5Item } from '@/module/item/SR5Item';
import { SR5Actor } from '@/module/actor/SR5Actor';

/**
 * ActorOwnershipFlow should handle the Ownership of items by actors
 * - This works off of foundry ownership
 */
export const ActorOwnershipFlow = {

    ownedActorIconsOf(actor: SR5Actor): SR5Actor[] {
        const map = new Map<string, SR5Actor>();
        // first collect all the actors on the scene
        if (canvas.scene?.tokens) {
            for (const token of canvas.scene.tokens) {
                if (!token.actor) continue;
                // don't add ourselves
                if (token.actor.uuid === actor.uuid) continue;

                if (token.actor instanceof SR5Actor
                        && this._isOwnerOfActor(actor, token.actor)) {
                    map.set(token.actor.uuid, token.actor);
                }
            }
        }
        // next, go over all game actors and get the ones our actor ows
        for (const a of game.actors) {
            if (a.uuid === actor.uuid || map.has(a.uuid)) continue;
            if (a instanceof SR5Actor
                    && ActorOwnershipFlow._isOwnerOfActor(actor, a)) {
                map.set(a.uuid, a);
            }
        }
        return Array.from(map.values());
    },

    ownedItemIconsOf(actor: SR5Actor): SR5Item[] {
        // for now just return actor's items
        return actor.wirelessDevices;
    },

    ownedIconsOf(actor: SR5Actor): (SR5Actor | SR5Item)[] {
        return [...this.ownedItemIconsOf(actor), ...this.ownedActorIconsOf(actor)];
    },

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
