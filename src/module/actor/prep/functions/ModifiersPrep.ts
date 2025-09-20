import { SR5 } from "../../../config";

export class ModifiersPrep {
    static clearAttributeMods(system: Actor.SystemOfType<'character' | 'critter' | 'ic' | 'spirit' | 'sprite' | 'vehicle'>) {
        const { attributes } = system;
        for (const [name, attribute] of Object.entries(attributes)) {
            // Check for valid attributes. Active Effects can cause unexpected properties to appear.
            if (!SR5.attributes.hasOwnProperty(name) || !attribute) return;

            attribute.mod = [];
        }
    }

    static clearArmorMods(system:Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'vehicle'>) {
        const {armor} = system;

        armor.mod = [];
    }

    static clearLimitMods(system: Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'sprite' | 'vehicle'>) {
        const {limits} = system;
        for (const [name, limit] of Object.entries(limits)) {
            if (!SR5.limits.hasOwnProperty(name) || !limit) return;

            limit.mod = [];
        }
    }

    /**
     * Clear out modifierse from all calculate values, no matter where from and what.
     * 
     * This is necessary to avoid items and naive modifications doubling up shoudl they be
     * saved with update calls
     * 
     */
    static clearValueMods(system: Actor.SystemOfType<'character'>) {
        for (const [, values] of Object.entries(system.values)) {
            values.mod = [];
        }
    }
}
