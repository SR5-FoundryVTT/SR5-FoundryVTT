import { PartsList } from "../../../parts/PartsList";
import { SR5Item } from "../../SR5Item";
import { Helpers } from '../../../helpers';
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
        const rangeParts = new PartsList<number>();
        
        // Apply ammo recoil compensation.
        equippedMods.forEach(mod => {
            if (mod.system.rc) rangeParts.addUniquePart(mod.name as string, mod.system.rc);            
        });
        range.rc.mod = rangeParts.list;
        range.rc.value = Helpers.calcTotal(range.rc);
    }
}