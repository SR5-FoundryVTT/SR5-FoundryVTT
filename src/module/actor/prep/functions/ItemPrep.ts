import SR5ActorData = Shadowrun.SR5ActorData;
import { SR5ItemDataWrapper } from '../../../item/SR5ItemDataWrapper';
import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';
import ArmorActorData = Shadowrun.ArmorActorData;

export class ItemPrep {
    /**
     * Prepare the armor data for the Item
     * - will only allow one "Base" armor item to be used (automatically takes the best one if multiple are equipped)
     * - all "accessories" will be added to the armor
     */
    static prepareArmor(data: SR5ActorData & ArmorActorData, items: SR5ItemDataWrapper[]) {
        const { armor } = data;
        armor.base = 0;
        armor.value = 0;
        armor.mod = [];
        for (const element of Object.keys(CONFIG.SR5.elementTypes)) {
            armor[element] = 0;
        }

        const armorModParts = new PartsList<number>(armor.mod);
        const equippedArmor = items.filter((item) => item.couldHaveArmor() && item.isEquipped());
        equippedArmor?.forEach((item) => {
            // Don't spam armor values with clothing or armor like items without any actual armor.
            if (item.hasArmor()) {
                // We allow only one base armor but multiple armor accessories
                if (item.hasArmorAccessory()) {
                    armorModParts.addUniquePart(item.getName(), item.getArmorValue());
                }
                else {
                    const armorValue = item.getArmorValue();
                    if (armorValue > armor.base) {
                        armor.base = item.getArmorValue();
                        armor.label = item.getName();
                    }
                }
            }

            // Apply elemental modifiers of all worn armor and clothing SR5#169.
            for (const element of Object.keys(CONFIG.SR5.elementTypes)) {
                armor[element] += item.getArmorElements()[element];
            }
        });

        if (data.modifiers['armor']) armorModParts.addUniquePart(game.i18n.localize('SR5.Bonus'), data.modifiers['armor']);
        // SET ARMOR
        armor.value = Helpers.calcTotal(armor);
    }
    /**
     * Prepare actor data for ware changes
     * - this calculates the actors essence
     */
    static prepareBodyware(data: SR5ActorData, items: SR5ItemDataWrapper[]) {
        const { attributes } = data;
        const parts = new PartsList<number>();
        // add Items as values to lower the total value of essence
        items
            .filter((item) => item.isBodyware() && item.isEquipped())
            .forEach((item) => {
                if (item.getEssenceLoss()) {
                    parts.addUniquePart(item.getName(), -Number(item.getEssenceLoss()));
                }
            });
        // add the bonus from the misc tab if applied
        const essenceMod = data.modifiers['essence'];
        if (essenceMod && !Number.isNaN(essenceMod)) {
            parts.addUniquePart('SR5.Bonus', Number(essenceMod));
        }

        attributes.essence.base = 6;
        attributes.essence.mod = parts.list;
        attributes.essence.value = Helpers.calcTotal(attributes.essence);
    }
}
