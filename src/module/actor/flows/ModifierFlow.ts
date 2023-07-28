import { SuccessTest } from './../../tests/SuccessTest';
import {SR5Actor} from "../SR5Actor";

/**
 * Options for calling the general modifier access helper method ModifierFlow#totalFor.
 */
export interface ModifierFlowOptions {
    // Set true to always re-apply selections.
    reapply?: boolean;
    // See SituationModifier applicable
    applicable?: string[]
    // If called from SuccessTest or sub-class context, allow it's documents and data to 
    // influence modifier calculation.
    test?: SuccessTest
}

/**
 * Map the different kinds of modifier handlings that have been deployed accross the systems lifetime.
 * 
 * All actor modifier totals should be access through this interface and only mapped onto the whatever
 * data / api lies underneath.
 * 
 * Use this interface to retrieve a total value, not values used to create that total.
 * 
 */
export class ModifierFlow {
    // The actor document to retrieve modifiers for.
    actor: SR5Actor;

    constructor(actor: SR5Actor) {
        this.actor = actor;
    }

    /**
     * Retrieve a total modifier value for a specific modifier
     * 
     * @param name The internal modifiers name. This can either be a situation modifier or an actor modifier
     * @param options 
     * @returns Total value requested or zero, should the requested modifier not exist.
     */
    totalFor(name: string, options: ModifierFlowOptions={}): number {
        // Get special cases that need local handling.
        if (this[name] !== undefined) return this[name];

        // Get global modifiers that can come from the general modifier system.
        const modifiers = this.actor.getSituationModifiers();
        if (modifiers.handlesTotalFor(name)) return modifiers.getTotalFor(name, options);

        // Get global modifiers that come from the legacy actor modifier system.
        return Number(this.actor.system.modifiers[name] ?? 0);
    }

    /**
     * Translate simple modifier type string to the differently named actor / document method.
     */
    get wounds(): number {
        return this.actor.getWoundModifier();
    }
}