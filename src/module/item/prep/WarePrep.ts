import { SR } from "../../constants";
import { Helpers } from "../../helpers";
import type { SR5Item } from "../SR5Item";
import { ModifiableValue } from "@/module/mods/ModifiableValue";
import { AvailabilityValueType } from "@/module/types/template/Technology";


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

        system.technology.calculated.essence.value += modificationEssence;
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
            system.technology.calculated.essence.value = system.essence;
            system.technology.calculated.essence.adjusted = false;
            new ModifiableValue(system.technology.cost).remove('SR5.Grade');
            WarePrep.removeAvailabilityGradeChange(system.technology.availability);
            return;
        }

        const essenceMod = SR.gradeModifiers[grade].essence ?? 1;
        const availMod = SR.gradeModifiers[grade].avail ?? 0;
        const costMod = SR.gradeModifiers[grade].cost ?? 1;

        // Alter essence values.
        const floatEssence = Number(system.essence || 0) * essenceMod;
        const actualEssence = Helpers.roundTo(floatEssence, 4);
        system.technology.calculated.essence.adjusted = true;

        const cost = new ModifiableValue(system.technology.cost);
        cost.addUnique('SR5.Grade', costMod, { type: 'multiply', priority: ModifiableValue.BASE_PRIORITY + 1 });
        WarePrep.setAvailabilityGradeChange(system.technology.availability, availMod);

        system.technology.calculated.essence.value = actualEssence;
    },

    setAvailabilityGradeChange(availability: AvailabilityValueType, value: number) {
        const index = availability.changes.findIndex(change => change.name === 'SR5.Grade');
        if (!value) {
            if (index !== -1) availability.changes.splice(index, 1);
            return;
        }

        const change = {
            enabled: true,
            invalidated: false,
            name: 'SR5.Grade',
            priority: ModifiableValue.BASE_PRIORITY + 1,
            source: '',
            type: 'add',
            value,
        };

        if (index === -1) availability.changes.push(change);
        else availability.changes[index] = change;
    },

    removeAvailabilityGradeChange(availability: AvailabilityValueType) {
        availability.changes = availability.changes.filter(change => change.name !== 'SR5.Grade');
    },
}
