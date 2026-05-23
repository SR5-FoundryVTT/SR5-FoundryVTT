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

        // NOTE: We retrieve different types of items, all containing armor data.
        const equippedArmor = items.filter((item) => item.hasArmor() && item.isEquipped()) as SR5Item<'armor'>[];
        const immunityRating = Math.max(system.attributes.essence.value * 2, 0);

        for (const item of equippedArmor) {
            const normalArmor = item.system.armor.value;
            const hardenedArmor = item.system.armor.hardened;

            // Don't spam armor values with clothing or armor like items without any actual armor.
            if (normalArmor) {
                // We allow only one base armor but multiple armor accessories
                if (item.system.armor.accessory) {
                    ModifiableValue.add(armor.rating, item.name, normalArmor);
                } else {
                    ModifiableValue.add(
                        armor.rating, item.name, normalArmor,
                        { mode: 'UPGRADE', priority: ModifiableValue.BASE_PRIORITY }
                    );
                }
            }

            if (hardenedArmor) {
                if (item.system.armor.accessory) {
                    ModifiableValue.add(armor.hardened, item.name, hardenedArmor);
                } else {
                    ModifiableValue.add(
                        armor.hardened, item.name, hardenedArmor,
                        { mode: 'UPGRADE', priority: ModifiableValue.BASE_PRIORITY }
                    );
                }
            }

            // Apply elemental modifiers of all worn armor and clothing SR5#169.
            for (const element of Object.keys(item.system.armor.elements)) {
                if (!armor.elements[element]) continue;
                ModifiableValue.add(armor.elements[element], item.name, item.system.armor.elements[element].value);
            }

            for (const immunity of item.system.armor.immunities.value) {
                if (!armor.immunities[immunity]) continue;
                // Immunity rating is trait-like: apply once per immunity type, not per item piece.
                ModifiableValue.addUnique(armor.immunities[immunity], `SR5.armorImmunityTypes.${immunity}`, immunityRating);
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
}
