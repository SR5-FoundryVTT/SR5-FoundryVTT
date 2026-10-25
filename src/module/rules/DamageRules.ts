import type { DamageType } from "../types/item/Action";

/**
 * Rules around the elements of a damage packet.
 */
export const DamageRules = {
    /**
     * All elements of a damage, like a weapon dealing fire and water damage at once.
     * Every element counts in full, none is the main one. SG#169 'Firewater', #1214.
     */
    elements(damage: Pick<DamageType, 'element'> & { elements?: string[] }): string[] {
        const elements = new Set<string>(damage.elements ?? []);
        if (damage.element?.value) elements.add(damage.element.value);
        return [...elements];
    },

    /**
     * Is the damage of the given element, as one of its elements?
     */
    hasElement(damage: Pick<DamageType, 'element'> & { elements?: string[] }, element: string): boolean {
        return DamageRules.elements(damage).includes(element);
    },
};
