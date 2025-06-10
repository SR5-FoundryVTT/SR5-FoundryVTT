import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';
import { SR5 } from "../../../config";
import { SR5Item } from 'src/module/item/SR5Item';

export class ItemPrep {
    /**
     * Prepare the armor data for the Item
     * - will only allow one "Base" armor item to be used (automatically takes the best one if multiple are equipped)
     * - all "accessories" will be added to the armor
     */
    static prepareArmor(system: Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'vehicle'>, items: SR5Item[]) {
        const { armor } = system;
        armor.base = 0;
        armor.value = 0;

        for (const element of Object.keys(SR5.elementTypes)) {
            armor[element] = 0;
        }

        const armorModParts = new PartsList<number>(armor.mod);
        const equippedArmor = items.filter((item) => item.isType('armor') && item.isEquipped()) as SR5Item<'armor'>[];
        equippedArmor?.forEach((item) => {
            const armorValue = item.system.armor.value;
            // Don't spam armor values with clothing or armor like items without any actual armor.
            if (armorValue > 0) {
                // We allow only one base armor but multiple armor accessories
                if (item.system.armor.mod) {
                    armorModParts.addUniquePart(item.name, item.system.armor.value);
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
        });

        if (system.modifiers['armor']) armorModParts.addUniquePart(game.i18n.localize('SR5.Bonus'), system.modifiers['armor']);
        // SET ARMOR
        armor.value = Helpers.calcTotal(armor);
    }
    /**
     * Apply all changes to an actor by their 'ware items.
     * 
     * Modify essence by items essence loss
     */
    static prepareWareEssenceLoss(system: Actor.SystemOfType<'character' | 'critter'>, items: SR5Item<'bioware' | 'cyberware'>[]) {
        const parts = new PartsList<number>(system.attributes.essence.mod);
        
        items
            .filter((item) => item.asType('bioware', 'cyberware') && item.isEquipped())
            .forEach((item) => {
                if (item.getEssenceLoss()) {
                    parts.addPart(item.name, -item.getEssenceLoss());
                }
            });

        system.attributes.essence.mod = parts.list;
    }
}
