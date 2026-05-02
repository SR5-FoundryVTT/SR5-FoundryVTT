import { SR5 } from "../../../config";
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
        armor.base = 0;
        armor.value = 0;

        // NOTE: We retrieve different types of items, all containing armor data.
        const equippedArmor = items.filter((item) => item.hasArmor() && item.isEquipped()) as SR5Item<'armor'>[];
        for (const item of equippedArmor) {
            const armorValue = item.system.armor.value;
            // Don't spam armor values with clothing or armor like items without any actual armor.
            if (armorValue > 0) {
                // We allow only one base armor but multiple armor accessories
                if (item.system.armor.mod) {
                    ModifiableValue.addUnique(armor, item.name, item.system.armor.value);
                } else if (armorValue > armor.base) {
                    armor.base = armorValue;
                    armor.label = item.name;
                    armor.hardened = item.system.armor.hardened;
                }
            }

            // Apply elemental modifiers of all worn armor and clothing SR5#169.
            for (const element of Object.keys(SR5.elementTypes)) {
                armor[element] += item.getArmorElements()[element];
            }
        }

        if (system.modifiers.armor)
            ModifiableValue.addUnique(armor, game.i18n.localize('SR5.Bonus'), system.modifiers.armor);

        ModifiableValue.calcTotal(armor);
    }

    /**
     * Cleanup any lingering armor element values from _source
     * 
     * These values will be derived from:
     * - ActiveEffect changes applied
     * - equipped armor items and their elemental modifiers
     */
    static clearArmorElements(system: Actor.SystemOfType<'character' | 'spirit' | 'vehicle'>) {
        for (const element of Object.keys(SR5.elementTypes)) {
            system.armor[element] = 0;
        }
    }
}
