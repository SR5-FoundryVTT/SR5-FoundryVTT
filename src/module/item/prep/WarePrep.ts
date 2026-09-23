import { SR } from "../../constants";
import { Helpers } from "../../helpers";
import type { SR5Item } from "../SR5Item";
import { ModifiableValue } from "@/module/mods/ModifiableValue";


/**
 * Prepare item data for Cyberware and Bioware items.
 */
export const WarePrep = {
    prepareBaseData(
        system: Item.SystemOfType<'bioware' | 'cyberware'>,
        equippedMods: SR5Item<'modification'>[] = []
    ) {
        WarePrep.prepareCapacity(system, equippedMods);
        WarePrep.prepareGrade(system);
        WarePrep.prepareEssence(system, equippedMods);
    },

    prepareCapacity(
        system: Item.SystemOfType<'bioware' | 'cyberware'>,
        equippedMods: SR5Item<'modification'>[]
    ) {
        system.capacity.used = equippedMods.reduce((used, mod) => used + mod.system.slots, 0);
    },

    prepareEssence(
        system: Item.SystemOfType<'bioware' | 'cyberware'>,
        equippedMods: SR5Item<'modification'>[]
    ) {
        const modificationEssence = equippedMods.reduce((essence, mod) => {
            const quantity = mod.system.technology.quantity || 1;
            return essence + (mod.system.essence * quantity);
        }, 0);

        system.technology.essence.value = system.technology.essence.base + modificationEssence;
    },

    /**
     * Calculate values based on grade.
     *
     * @param item The item for additional data
     * @param technology The system technology section to be altered
     */
    prepareGrade(system: Item.SystemOfType<'bioware' | 'cyberware'>) {
        let grade = system.grade;

        // Old versions could contain malformed grade values. Leave automated grade calculation to newer version. (<0.27.0)
        if (!SR.gradeModifiers[grade]) {
            console.warn(`Grade "${grade}" is not defined in SR.gradeModifiers. Using standard values.`);
            grade = 'standard';
        }

        if (grade === 'standard') {
            system.technology.essence.base = system.essence;
            ModifiableValue.remove(system.technology.cost, 'SR5.Grade');
            ModifiableValue.remove(system.technology.availability, 'SR5.Grade');
            return;
        }

        const essenceMod = SR.gradeModifiers[grade].essence ?? 1;
        const availMod = SR.gradeModifiers[grade].avail ?? 0;
        const costMod = SR.gradeModifiers[grade].cost ?? 1;

        // Alter essence values.
        const floatEssence = Number(system.essence || 0) * essenceMod;
        const actualEssence = Helpers.roundTo(floatEssence, 4);

        ModifiableValue.addUnique(system.technology.cost, 'SR5.Grade', costMod, { type: 'multiply', priority: ModifiableValue.Priority.GRADE });
        ModifiableValue.setUnique(system.technology.availability, 'SR5.Grade', availMod, { type: 'add', priority: ModifiableValue.Priority.GRADE });

        system.technology.essence.base = actualEssence;
    },
}
