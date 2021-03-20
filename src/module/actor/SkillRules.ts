import SkillField = Shadowrun.SkillField;
import {PartsList} from "../parts/PartsList";
import {SR5} from "../config";
import {SR} from "../constants";

export class SkillRules {
    /**
     * Allow defaulting a skill role.
     * @PDF SR5#130
     * @param skill Check for this skills ability to be defaulted.
     * @return true will allow for a SuccessTest / role to proceed.
     */
    static allowDefaultingRoll(skill: SkillField): boolean {
        // Check for skill defaulting at the base, since modifiers or bonus can cause a positive pool, while
        // still defaulting.
        return skill.base === 0 && skill.canDefault;
    }

    /**
     * Allow a skill role.
     * @PDF SR5#130
     * @param skill Check for this skills ability to be rolled.
     * @return true will allow for a SuccessTest / role to proceed.
     */
    static allowRoll(skill: SkillField): boolean {
        return skill.base > 0 || SkillRules.allowDefaultingRoll(skill);
    }

    /**
     * Add the defaulting modifier part to a parts list
     * @param parts Should be a PartsList involved with skills.
     */
    static addDefaultingPart(parts: PartsList<number>) {
        parts.addUniquePart('SR5.Defaulting', SR.skill.DEFAULTING_MODIFIER);
    }
}