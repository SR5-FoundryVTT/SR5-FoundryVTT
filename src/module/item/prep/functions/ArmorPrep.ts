import { SR5Item } from "../../SR5Item";

/**
 * Item data preparation around armor values and armor modification capacity.
 */
export const ArmorPrep = {
    prepareData(item: SR5Item, equippedMods: SR5Item<'modification'>[]) {
        const armor = item.system.armor;
        if (!armor) return;

        armor.value = armor.is_hardened ? 0 : armor.base;
        armor.hardened = armor.is_hardened ? armor.base : 0;
        for (const element of Object.keys(armor.elements)) {
            armor.elements[element].value = armor.elements[element].base;
        }

        if (item.system.capacity)
            item.system.capacity.used = 0;

        const mergedImmunities = new Set(armor.immunities.base);

        for (const mod of equippedMods) {
            if (mod.system.mod_armor.is_hardened)
                armor.hardened += mod.system.mod_armor.value;
            else
                armor.value += mod.system.mod_armor.value;

            if (item.system.capacity)
                item.system.capacity.used += mod.system.slots;

            for (const element of Object.keys(armor.elements)) {
                armor.elements[element].value += mod.system.mod_armor.elements[element];
            }

            for (const immunity of mod.system.mod_armor.immunities) {
                mergedImmunities.add(immunity);
            }
        }

        armor.immunities.value = Array.from(mergedImmunities);
    }
};
