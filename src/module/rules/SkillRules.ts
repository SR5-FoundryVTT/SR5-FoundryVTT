import { SR } from "../constants";
import { ModifiableValue } from "../mods/ModifiableValue";
import { SkillFieldType } from "../types/template/Skills";
import { SR5 } from "../config";
import { SR5Actor } from "../actor/SR5Actor";

export class SkillRules {
    /**
     * Determing if a skills value / level makes defaulting necessary.
     * 
     * NOTE: A skill can be altered by an effect, which will leave it's base untouched. 
     *       Therefore it's calculated value must be used as a level
     * 
     * @param skill Any legacy or custom skill
     * @returns true, if a roll for the given skill must default.
     */
    static mustDefaultToRoll(skill: SkillFieldType): boolean {
        return skill.value === 0;
    }
    /**
     * Allow defaulting a skill role.
     * @PDF SR5#130
     * @param skill Check for this skills ability to be defaulted.
     * @return true will allow for a SuccessTest / role to proceed.
     */
    static allowDefaultingRoll(skill: SkillFieldType): boolean {
        // Check for skill defaulting at the base, since modifiers or bonus can cause a positive pool, while
        // still defaulting.
        return skill.canDefault;
    }

    /**
     * Allow a skill role.
     * @PDF SR5#130
     * @param skill Check for this skills ability to be rolled.
     * @return true will allow for a SuccessTest / role to proceed.
     */
    static allowRoll(skill: SkillFieldType): boolean {
        return !SkillRules.mustDefaultToRoll(skill) || SkillRules.allowDefaultingRoll(skill);
    }

    /**
     * Does actor match skills special requirements
     * @PDF SR5#130 While no direct rule reference, in general magic skills need a awakened character, 
     *              and resonance skills need a technomancer. This is what this function checks for.
     * @param actor The actor to check against
     * @param skill The derived skill data to use as reference
     * @return true, actor matches skill requirements.
     */
    static hasRequirements(actor: SR5Actor, skill: SkillFieldType) {
        if (skill.requirement === 'mundane') return true;
        const special = actor.system.special;
        return skill.requirement === special;
    }

    /**
     * Add the defaulting modifier part to a parts list
     * @param parts Should be a PartsList involved with skills.
     */
    static addDefaultingPart(parts: ModifiableValue) {
        parts.addUnique('SR5.Defaulting', SkillRules.defaultingModifier);
    }

    /**
     * Get the level a specific skill without its attribute.
     *  @param skill
     * @param options
     * @param options.specialization If true will add the default specialization bonus onto the level.
     */
    static level(skill: SkillFieldType, options = {specialization: false}) {
        if (this.mustDefaultToRoll(skill))
            return SkillRules.defaultingModifier;

        const specializationBonus = options.specialization ? SR.skill.SPECIALIZATION_MODIFIER : 0;

        return skill.value + specializationBonus;
    }

    static get defaultingModifier() {
        return SR.skill.DEFAULTING_MODIFIER;
    }

    static get SpecializationModifier() {
        return SR.skill.SPECIALIZATION_MODIFIER;
    }

    static knowledgeSkillAttribute(category: keyof typeof SR5.knowledgeAttributes): keyof typeof SR5.attributes | undefined {
        return SR5.knowledgeAttributes[category];
    }

    static languageSkillAttribute(): keyof typeof SR5.attributes {
        return 'intuition';
    }
    
    /**
     * These skill categories have predefined values like
     * - attributes
     * - defaulting
     * 
     * See SR5#128 'Skill Types'
     */
    static readonly skillCategoriesWithFixedAttributes = new Set(['knowledge', 'language']);
    static fixedCategoryValues(category: string) {
        return SkillRules.skillCategoriesWithFixedAttributes.has(category);
    }

    /**
     * Can a skill category be native?
     * 
     * See SR5#89 'Knowledge and Language Skills'
     */
    static canBeNativeCategory(category: string) {
        return category === 'language';
    }

    /**
     * Inject all attributes into testData that match the given attribute names list.
     *
     * Also implements the 'use bigger value rule',if necessary.
     *
     * @param names A list of attribute names to inject
     * @param source Actor to get the Skills from
     * @param rollData The testData to inject attributes into
     * @param options.bigger If true, the bigger value will be used, if false the source value will always be used.
     */
    static injectSkills(names: string[], source: SR5Actor, rollData: SR5Actor['system'], options: { bigger: boolean }) {
        const targetSkills = rollData.skills.active;
        for (const name of names) {
            // get the skill from the source, it may be undefined
            let sourceSkill = source.getSkill(name);
            if (!sourceSkill) continue;
            // if it is defined, duplicate it so we don't mess with the underlying data
            sourceSkill = foundry.utils.deepClone(sourceSkill);

            const targetSkill = targetSkills[name];

            if (options.bigger) {
                targetSkills[name] = sourceSkill.value > targetSkill.value ? sourceSkill : targetSkill;
            } else {
                targetSkills[name] = sourceSkill;
            }
        }
    }
}
