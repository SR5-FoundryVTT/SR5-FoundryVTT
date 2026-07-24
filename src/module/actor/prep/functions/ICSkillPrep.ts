import { MatrixRules } from '@/module/rules/MatrixRules';
import { ModifiableValue } from '@/module/mods/ModifiableValue';


export class ICSkillPrep {
    /**
     * IC resolves matrix action skills from host-derived rating.
     *
     * This keeps skill-based matrix actions aligned with IC's general host-rating based
     * pool construction while still using the normal SkillField flow for test resolution.
     * 
     * NOTE: We assume that all IC skills are derived from the host rating. All skills on an IC actor should behave that way.
     */
    static prepareSkills(system: Actor.SystemOfType<'ic'>) {
        const skillBase = MatrixRules.getICSkillBase(system.host.rating);

        // Host-derived anchor logged as a BASE_PRIORITY entry rather than written to `base`.
        for (const skillField of Object.values(system.skills.active)) {
            skillField.base = 0;
            ModifiableValue.addUniqueBase(skillField, 'SR5.BaseValue', skillBase);
        }
    }
}