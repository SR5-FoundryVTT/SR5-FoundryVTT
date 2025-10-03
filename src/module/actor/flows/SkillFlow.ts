import { SkillRules } from "../../rules/SkillRules";
import { PartsList } from "../../parts/PartsList";
import { FLAGS, SYSTEM_NAME } from "../../constants";
import { SkillFieldType } from "src/module/types/template/Skills";

export class SkillFlow {
    /**
     * Handle everything around how a skill should be defaulted
     * @param skill
     * @param parts
     */
    static handleDefaulting(skill: SkillFieldType, parts: PartsList) {
        if (!SkillRules.mustDefaultToRoll(skill)) return;

        if (!SkillFlow.allowDefaultingRoll(skill)) {
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.SkillCantBeDefault'));
            return;
        }

        SkillRules.addDefaultingPart(parts);
    }

    /**
     * Check if either the system settings or skill configuration allow for a skill to be defaulted.
     * @param skill
     * @return true will allow a role on the skill that needs defaulting.
     */
    static allowDefaultingRoll(skill: SkillFieldType): boolean {
        // Check if settings allow rolls of skills that otherwise would need to be defaulted.
        const allowUnimproviseable = !game.settings.get(SYSTEM_NAME, FLAGS.OnlyAllowRollOnDefaultableSkills);
        if (allowUnimproviseable)
            return true;

        return SkillRules.allowDefaultingRoll(skill);
    }

    static allowRoll(skill: SkillFieldType): boolean {
        if (SkillRules.mustDefaultToRoll(skill) && SkillFlow.allowDefaultingRoll(skill)) {
            return true;
        }
        return SkillRules.allowRoll(skill);
    }

    static isCustomSkill(skill: SkillFieldType): boolean {
        return skill.name !== undefined && skill.name !== '';
    }

    static isLegacySkill(skill: SkillFieldType): boolean {
        return !SkillFlow.isCustomSkill(skill);
    }
}