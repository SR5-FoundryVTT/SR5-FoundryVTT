import { SkillRules } from "../../rules/SkillRules";
import { PartsList } from "../../parts/PartsList";
import { FLAGS, SYSTEM_NAME } from "../../constants";
import { KnowledgeSkillCategory, SkillFieldType } from "src/module/types/template/Skills";
import { SR5Item } from "@/module/item/SR5Item";
import { Translation } from "@/module/utils/strings";
import { DataDefaults } from "@/module/data/DataDefaults";
import { Helpers } from "@/module/helpers";

// A skill storage structure for easier access to character skill items.
export interface Skills {
    // quick access based on name and label.
    // TODO: tamif - these must be removed, as name / locale isn't unquie across skill types.
    named: Map<string, SR5Item<'skill'>>
    localized: Map<string, SR5Item<'skill'>>
    // sorted lists for sheet display.
    active: SR5Item<'skill'>[]
    language: SR5Item<'skill'>[]
    knowledge: {
        academic: SR5Item<'skill'>[]
        professional: SR5Item<'skill'>[]
        street: SR5Item<'skill'>[]
        interests: SR5Item<'skill'>[]
    }
};

/**
 * Handle functionality between actors and their skills.
 */
// TODO: tamif - refactor into object style
export class SkillFlow {
    /**
     * Handle everything around how a skill should be defaulted
     */
    static handleDefaulting(skill: SR5Item<'skill'>, parts: PartsList<number>) {
        if (!SkillRules.mustDefaultToRoll(skill)) return;

        if (!SkillFlow.allowDefaultingRoll(skill)) {
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.SkillCantBeDefault'));
            return;
        }

        SkillRules.addDefaultingPart(parts);
    }

    /**
     * Check if either the system settings or skill configuration allow for a skill to be defaulted.
     * @return true will allow a role on the skill that needs defaulting.
     */
    static allowDefaultingRoll(skill: SR5Item<'skill'>): boolean {
        // Check if settings allow rolls of skills that otherwise would need to be defaulted.
        const allowUnimproviseable = !game.settings.get(SYSTEM_NAME, FLAGS.OnlyAllowRollOnDefaultableSkills);
        if (allowUnimproviseable)
            return true;

        return SkillRules.allowDefaultingRoll(skill);
    }

    static allowRoll(skill: SR5Item<'skill'>): boolean {
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

    /**
     * Derive actor skill data from their skill items.
     * 
     * @param items Skill items to transform. It must only be skill items.
     * @returns 
     */
    static prepareActorSkills(items: SR5Item<'skill'>[]) {
        const skills = {
            active: {},
            language: {},
            knowledge: {
                street: {},
                academic: {},
                professional: {},
                interests: {},
            }
        }

        const skillItems = items.filter(item => item.system.type === 'skill');

        for (const item of skillItems) {
            if (!item.isType('skill')) continue;

            // Name is user input but used for json storage here. It should match
            // overall naming scheme.
            const key = item.name?.replace(' ', '_').toLowerCase() ?? item.id!;
            
            const skill = DataDefaults.createData("skill_field", {
                id: item.id,
                name: item.name,
                // TODO: tamif - check for translation support
                label: SkillFlow.localizeSkillName(item.name),
                base: item.system.skill.rating,
                description: item.system.description.value,
                attribute: item.system.skill.attribute,
                canDefault: item.system.skill.defaulting,
            });

            switch(item.system.skill.category) {
                case 'active':
                    SkillFlow.addSkill(skills.active, skill, key);
                    break;
                case 'language':
                    SkillFlow.addSkill(skills.language, skill, key);
                
                    break;
                case 'knowledge':
                    const knowledgeType = item.system.skill.knowledgeType as KnowledgeSkillCategory;
                    SkillFlow.addSkill(skills.knowledge[knowledgeType], skill, key);
                    break;
            }
        }
        
        // TODO: tamif - implement sorting again

        return skills;
    }

    /**
     * Add a single skill to the list of skills within system.skills.
     * 
     * We have to check for certain edge cases here, as we deal with user input.
     */
    private static addSkill(skills: Record<string, SkillFieldType>, skill: SkillFieldType, key: string) {
        if (Object.hasOwn(skills, key)) {
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.SkillAlreadyExists'));
            return;
        }
        skills[key] = skill;
    }

    /**
     * Alphabetically sort skills either by their translated label. Should a skill not have one, use the name as a
     * fallback.
     *
     * Sorting should be aware of UTF-8, however please blame JavaScript if it's not. :)
     *
     * @param skills
     * @param asc Set to true for ascending sorting order and to false for descending order.
     * @return Sorted Skills given by the skills parameter
     */
    static sortSkills(skills: SR5Item<'skill'>[], asc = true) {
        // Filter entries instead of values to have a store of ids for easy rebuild.
        const sortedSkills = skills.sort((a, b) => {
            const comparatorA = SkillFlow.localizeSkillName(a.name);
            const comparatorB = SkillFlow.localizeSkillName(b.name);
            // Use String.localeCompare instead of the > Operator to support other alphabets.
            if (asc)
                return comparatorA.localeCompare(comparatorB) === 1 ? 1 : -1;
            else
                return comparatorA.localeCompare(comparatorB) === 1 ? -1 : 1;
        });

        const sortedSkillsObject = {};
        sortedSkills.forEach(skill => {
            const translated = SkillFlow.localizeSkillName(skill.name);
            sortedSkillsObject[translated] = skill;
        });

        return sortedSkillsObject;
    }

    /**
     * Translate the skill name into a localized version, if possible.
     */
    static localizeSkillName(name: string) {
        return Helpers.localizeName(name, 'SR5.Skill');
    }

    /**
     * Prepare a default data structure for skill items that allows to
     * better retrieve them compared to a flat skill item list.
     */
    static getDefaultActorSkills(): Skills {
        return {
            // quick access based on name and label.
            named: new Map(),
            localized: new Map(),
            // sorted lists for sheet display.
            active: [],
            language: [],
            knowledge: {
                academic: [],
                professional: [],
                street: [],
                interests: [],
            }
        };
    }
}
