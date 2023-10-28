import { PartsList } from "../../../parts/PartsList";
import { SR5Item } from "../../SR5Item";
/**
 * Weapon item data preparation
 */
export const RangePrep = {
    /**
     * Prepare a ranged weapons recoil compensation.
     * 
     * @param range The system range data for weapons to be altered.
     * @param equippedMods Those item mods that are equipped.
     */
    prepareRecoilCompensation(range: Shadowrun.RangeWeaponData, equippedMods: SR5Item[]) {
        const rangeParts = new PartsList();
        equippedMods.forEach((mod) => {
            //@ts-ignore // TypeScript doesn't like this.system Item.Data<DataType> possibly being all the things.
            //@ts-ignore // TODO: foundry-vtt-types v10 
            if (mod.system.rc) rangeParts.addUniquePart(mod.name, mod.system.rc);
            // handle overrides from ammo
        });
        //@ts-ignore // TypeScript doesn't like this.system Item.Data<DataType> possibly being all the things.
        range.rc.mod = rangeParts.list;
        //@ts-ignore // TypeScript doesn't like this.system Item.Data<DataType> possibly being all the things.
        if (range.rc) range.rc.value = Helpers.calcTotal(range.rc);
    }
}