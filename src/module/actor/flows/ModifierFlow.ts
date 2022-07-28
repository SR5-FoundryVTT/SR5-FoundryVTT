import {SR5Actor} from "../SR5Actor";


/**
 * A legacy mapper to have a single, easy to use entry point to fetch modifier types of an actor.
 *
 * Some modifier types are stored somewhere in an actor's data at different places.
 *
 */
export class ModifierFlow {
    document: SR5Actor;

    constructor(document: SR5Actor) {
        this.document = document;
    }

    async totalFor(type: string): Promise<number> {
        // Get special cases that need local handling.
        if (this[type] !== undefined) return this[type];

        // Get global modifiers that can come from the general modifier system.
        const modifiers = await this.document.getModifiers();
        if (modifiers.modifiers.hasOwnProperty(type)) return modifiers.getTotalForType(type);

        // Get global modifiers that come from the legacy actor modifier system.
        return this.document.getModifier(type) || 0;
    }

    get wounds(): number {
        return this.document.getWoundModifier();
    }
}