import { RangeWeaponType } from "src/module/types/item/Weapon";
import { PartsList } from "../../../parts/PartsList";
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
        const rangeParts = new PartsList(range.rc);

        // Apply ammo recoil compensation.
        for (const mod of equippedMods)
            if (mod.system.rc)
                rangeParts.addPart(mod.name, mod.system.rc);

        PartsList.calcTotal(range.rc);
    }
}
