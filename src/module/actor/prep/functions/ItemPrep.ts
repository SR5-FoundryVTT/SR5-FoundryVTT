import { SR5Item } from 'src/module/item/SR5Item';
import { ModifiableValue } from '@/module/mods/ModifiableValue';

export class ItemPrep {
    /**
     * Prepare the armor data for the Item
     * - will only allow one "Base" armor item to be used (automatically takes the best one if multiple are equipped)
     * - all "accessories" will be added to the armor
     */
    static prepareArmor(system: Actor.SystemOfType<'character' | 'spirit' | 'vehicle'>, items: SR5Item[]) {
        const { armor } = system;
        armor.rating.base = 0;
        armor.rating.value = 0;
        armor.hardened.base = 0;
        armor.hardened.value = 0;

        for (const element of Object.keys(armor.elements)) {
            armor.elements[element].base = 0;
            armor.elements[element].value = 0;
        }
        for (const immunity of Object.keys(armor.immunities)) {
            armor.immunities[immunity].base = 0;
            armor.immunities[immunity].value = 0;
        }

        // NOTE: We retrieve different types of items, all containing armor data.
        const equippedArmor = items.filter((item) => item.hasArmor() && item.isEquipped()) as SR5Item<'armor'>[];
        const immunityRating = Math.max(system.attributes.essence.value * 2, 0);

        for (const item of equippedArmor) {
            const armorValue = item.system.armor.value;
            // Don't spam armor values with clothing or armor like items without any actual armor.
            if (armorValue > 0) {
                // We allow only one base armor but multiple armor accessories
                if (item.system.armor.mod) {
                    ModifiableValue.addUnique(armor.rating, item.name, item.system.armor.value);
                    if (item.system.armor.hardened) {
                        ModifiableValue.addUnique(armor.hardened, item.name, item.system.armor.value);
                    }
                } else if (armorValue > armor.rating.base) {
                    armor.rating.base = armorValue;
                    armor.label = item.name;
                }

                if (!item.system.armor.mod) {
                    if (item.system.armor.hardened && armorValue > armor.hardened.base) {
                        armor.hardened.base = armorValue;
                    }
                }
            }

            // Apply elemental modifiers of all worn armor and clothing SR5#169.
            for (const element of Object.keys(item.system.armor.elements ?? {})) {
                if (!armor.elements[element]) continue;
                ModifiableValue.addUnique(armor.elements[element], item.name, item.system.armor.elements[element]);
            }

            for (const immunity of item.system.armor.immunities ?? []) {
                if (!armor.immunities[immunity]) continue;
                // Immunity rating is trait-like: apply once per immunity type, not per item piece.
                ModifiableValue.addUnique(armor.immunities[immunity], `SR5.Armor.Immunity.${immunity}`, immunityRating);
            }
        }

        if (system.modifiers.armor)
            ModifiableValue.addUnique(armor.rating, game.i18n.localize('SR5.Bonus'), system.modifiers.armor);

        ModifiableValue.calcTotal(armor.rating);
        ModifiableValue.calcTotal(armor.hardened);
        for (const element of Object.values(armor.elements)) {
            ModifiableValue.calcTotal(element);
        }
        for (const immunity of Object.values(armor.immunities)) {
            ModifiableValue.calcTotal(immunity);
        }
    }

    /**
     * Cleanup any lingering armor element values from _source
     * 
     * These values will be derived from:
     * - ActiveEffect changes applied
     * - equipped armor items and their elemental modifiers
     */
    static clearArmorElements(system: Actor.SystemOfType<'character' | 'spirit' | 'vehicle'>) {
        system.armor.hardened.base = 0;
        system.armor.hardened.value = 0;

        for (const element of Object.keys(system.armor.elements)) {
            system.armor.elements[element].base = 0;
            system.armor.elements[element].value = 0;
        }

        for (const immunity of Object.keys(system.armor.immunities)) {
            system.armor.immunities[immunity].base = 0;
            system.armor.immunities[immunity].value = 0;
        }
    }
}
