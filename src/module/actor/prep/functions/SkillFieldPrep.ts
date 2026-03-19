import { KnowledgeSkillCategory, SkillFieldType, SkillsType } from 'src/module/types/template/Skills';
import { SR5Item } from '@/module/item/SR5Item';
import { DataDefaults } from '@/module/data/DataDefaults';
import { SkillNamingFlow } from '../../../flows/SkillNamingFlow';

/**
 * Builds and manages the actor-facing skill field structure derived from owned skill items.
 */
export const SkillFieldPrep = {
    /**
     * Prepare SkillField skills from Skill items. This is mainly intended for actor.system.skills storage
     * 
     * @param items Full list of skill items to transform.
     * @returns The transformed skills, grouped by categories.
     */
    prepareActorSkills(items: SR5Item<'skill'>[]) {
        const skills = {
            active: {},
            language: {},
            knowledge: {
                street: {},
                academic: {},
                professional: {},
                interests: {},
            }
        };

        const skillItems = items.filter(item => item.system.type === 'skill');

        for (const item of skillItems) {
            if (!item.isType('skill')) continue;

            const { key, skillField } = SkillFieldPrep.createSkillField(item);

            switch (item.system.skill.category) {
                case 'active':
                    SkillFieldPrep.addSkill(skills.active, skillField, key);
                    break;
                case 'language':
                    SkillFieldPrep.addSkill(skills.language, skillField, key);
                    break;
                case 'knowledge':
                    const knowledgeType = item.system.skill.knowledgeType as KnowledgeSkillCategory;
                    SkillFieldPrep.addSkill(skills.knowledge[knowledgeType], skillField, key);
                    break;
            }
        }

        return skills;
    },

    /**
     * Transform skill item to a skill field entry.
     */
    createSkillField(skill: SR5Item<'skill'>) {
            const key = SkillNamingFlow.nameToKey(skill.name) || skill.id!;
            const group = skill.system.skill.group;
            const hasCustomImage = skill.img && skill.img !== 'icons/svg/item-bag.svg';

            const skillField = DataDefaults.createData('skill_field', {
                id: skill.id,
                name: skill.name,
                img: hasCustomImage ? skill.img : '',
                label: SkillNamingFlow.localizeSkillName(skill.name),
                base: skill.system.skill.rating,
                description: skill.system.description.value,
                attribute: skill.system.skill.attribute,
                limit: skill.system.skill.limit.attribute,
                canDefault: skill.system.skill.defaulting,
                requirement: skill.system.skill.requirement,
                specs: skill.system.skill.specializations.map(spec => spec.name),
                group
            });

            return { key, skillField };
    },

    addSkill(skills: Record<string, SkillFieldType>, skill: SkillFieldType, key: string) {
        if (Object.hasOwn(skills, key)) {
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.SkillAlreadyExists'));
            return;
        }

        skills[key] = skill;
    },

    sortSkills(skills: SkillsType, asc = true) {
        const sortedSkills = Object.values(skills).sort((a, b) => {
            const comparatorA = a.label;
            const comparatorB = b.label;

            if (asc)
                return comparatorA.localeCompare(comparatorB) === 1 ? 1 : -1;
            else
                return comparatorA.localeCompare(comparatorB) === 1 ? -1 : 1;
        });

        const sortedSkillsObject = {};
        sortedSkills.forEach(skill => {
            const key = SkillNamingFlow.nameToKey(skill.name);
            sortedSkillsObject[key] = skill;
        });

        return sortedSkillsObject;
    },
};
