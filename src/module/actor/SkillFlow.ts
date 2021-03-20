import SkillField = Shadowrun.SkillField;
import {SkillRules} from "./SkillRules";
import {PartsList} from "../parts/PartsList";

export class SkillFlow {
    /**
     * Handle everything around how a skill should be defaulted
     * @param skill
     * @param parts
     */
    static handleDefaulting(skill: SkillField, parts: PartsList<number>) {
        if (SkillRules.allowDefaultingRoll(skill)) {
            SkillRules.addDefaultingPart(parts)
        } else {
            ui.notifications.warn(game.i18n.localize('SR5.Warnings.SkillCantBeDefault'));
        }
    }
}