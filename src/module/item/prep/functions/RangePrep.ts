import { RangeWeaponType } from "src/module/types/item/Weapon";
import { ModifiableValue } from "../../../mods/ModifiableValue";
import { SR5Item } from "../../SR5Item";
/**
 * Weapon item data preparation
 */
export const RangePrep = {
    prepareData(range: RangeWeaponType, equippedMods: SR5Item<'modification'>[]) {
        RangePrep.clearMods(range);
        RangePrep.prepareRecoilCompensation(range, equippedMods);
    },

    clearMods(range: RangeWeaponType) {
        range.rc.changes = [];
    },
    /**
     * Prepare a ranged weapons recoil compensation.
     * 
     * @param range The system range data for weapons to be altered.
     * @param equippedMods Those item mods that are equipped.
     */
    prepareRecoilCompensation(range: RangeWeaponType, equippedMods: SR5Item<'modification'>[]) {
        const rangeParts = new ModifiableValue(range.rc);

        // Apply ammo recoil compensation.
        for (const mod of equippedMods)
            if (mod.system.mod_weapon.rc)
                rangeParts.add(mod.name, mod.system.mod_weapon.rc);

        // Out-of-place: fold mod parts onto `.value` once (changes are cleared each prep by clearMods);
        // item ActiveEffects on rc apply natively on top in the derived apply loop.
        rangeParts.applyChanges();
    }
}
