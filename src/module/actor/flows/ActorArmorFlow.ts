import { DataDefaults } from "@/module/data/DataDefaults";
import { ModifiableValue } from "@/module/mods/ModifiableValue";
import { DamageType } from "@/module/types/item/Action";
import { ActorArmorType } from "@/module/types/template/Armor";

export const ActorArmorFlow = {
    /**
     * Return armor from actor system data and apply incoming damage modifiers.
     *
     * @param systemArmor The actor armor schema section.
     * @param damage Optional incoming damage with AP/element/immunity context.
     * @returns Modified armor data.
     */
    getArmor(systemArmor?: ActorArmorType, damage?: DamageType): ActorArmorType {
        // 1. Prepare base armor and damage data
        const armor = systemArmor
            ? (foundry.utils.duplicate(systemArmor) as ActorArmorType)
            : DataDefaults.createData('armor');

        damage ??= DataDefaults.createData('damage');

        ModifiableValue.calcTotal(damage);
        ModifiableValue.calcTotal(damage.ap);

        // 2. Modify by element
        const element = damage.element?.value;
        if (element) {
            const elArmor = armor.elements[element];
            ModifiableValue.calcTotal(elArmor, { min: 0 });
            if (elArmor.value > 0) {
                ModifiableValue.addUnique(armor.rating, 'SR5.Element.Label', elArmor.value);
            }
        }

        // 3. Merge strongest matching immunity into hardened armor
        if (element || damage.normal_weapon) {
            let immunityArmor = 0;

            if (damage.normal_weapon) {
                ModifiableValue.calcTotal(armor.immunities.normal_weapons);
                immunityArmor = Math.max(immunityArmor, armor.immunities.normal_weapons.value);
            }

            if (element) {
                ModifiableValue.calcTotal(armor.immunities[element]);
                immunityArmor = Math.max(immunityArmor, armor.immunities[element].value);
            }

            if (immunityArmor > 0) {
                ModifiableValue.addUnique(armor.hardened, 'SR5.Immunity', immunityArmor);
            }
        }

        // 4. Modify by penetration (AP)
        // Calculate current rating & hardened values before applying AP reduction
        ModifiableValue.calcTotal(armor.rating, { min: 0 });
        ModifiableValue.calcTotal(armor.hardened, { min: 0 });

        const ap = damage.ap.value;
        if (ap > 0) {
            // Positive AP increases normal armor only
            ModifiableValue.addUnique(armor.rating, 'SR5.AP', ap);
        } else if (ap < 0) {
            let apRemaining = Math.abs(ap);

            const applyReduction = (field: ActorArmorType['rating']) => {
                if (apRemaining <= 0 || field.value <= 0) return;
                const reduction = Math.min(field.value, apRemaining);
                ModifiableValue.addUnique(field, 'SR5.AP', -reduction);
                apRemaining -= reduction;
            };

            // Apply reduction in priority order
            applyReduction(armor.hardened);
            applyReduction(armor.rating);
        }

        // 5. Final calculation of modified fields
        ModifiableValue.calcTotal(armor.rating, { min: 0 });
        ModifiableValue.calcTotal(armor.hardened, { min: 0 });

        return armor;
    }
};

