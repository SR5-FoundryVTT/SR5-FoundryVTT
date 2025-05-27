import { Helpers } from "../../../helpers";
import { PartsList } from "../../../parts/PartsList";
import { SR5Item } from "../../SR5Item";

/**
 * Item data preparation around the 'technology' template.json item template.
 */
export const TechnologyPrep = {
    /**
     * Calculate the device condition monitor
     * 
     * See SR5#228 'Matrix Damage'
     * @param technology The system technology section to be altered
     */
    prepareConditionMonitor(technology: Item.SystemOfType<'ammo' | 'armor' | 'device' | 'equipment' | 'modification' | 'program' | 'sin' | 'bioware' | 'cyberware' | 'weapon'>['technology']) {        
        // taMiF: This seems to be legacy code to avoid a migration.
        //        Leave it in, as it doesn't hurt for now.
        if (technology.condition_monitor === undefined) {
            technology.condition_monitor = { value: 0, max: 0, label: '' };
        }
        
        const rating = typeof technology.rating === 'string' ? 0 : technology.rating;
        technology.condition_monitor.max = 8 + Math.ceil(rating / 2);
    },

    /**
     * Calculate a devices ability to conceal.
     * 
     * See SR5#419 'Concealing Gear'
     * @param technology The system technology section to be altered
     * @param equippedMods Those item mods that are equipped.
     */
    prepareConceal(technology: Item.SystemOfType<'ammo' | 'armor' | 'device' | 'equipment' | 'modification' | 'program' | 'sin' | 'bioware' | 'cyberware' | 'weapon'>['technology'], equippedMods: SR5Item<'modification'>[]) {
        // Calculate conceal data.
        //@ts-expect-error
        if (!technology.conceal) technology.conceal = {base: 0, value: 0, mod: []};

        const concealParts = new PartsList<number>();
        equippedMods.forEach((mod) => {
            if (mod.system.conceal && mod.system.conceal > 0) {
                concealParts.addUniquePart(mod.name as string, mod.system.conceal);
            }
        });

        technology.conceal.mod = concealParts.list;
        technology.conceal.value = Helpers.calcTotal(technology.conceal);
    }
}