import { KnowledgeSkillCategory, SkillFieldType, SkillsType } from 'src/module/types/template/Skills';
import { SR5Item } from '@/module/item/SR5Item';
import { DataDefaults } from '@/module/data/DataDefaults';
import { SkillNamingFlow } from '../../flows/SkillNamingFlow';

/**
 * Builds and manages the actor-facing skill field structure derived from owned skill items.
 */
export const SkillFieldFlow = {
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

            const key = SkillNamingFlow.nameToKey(item.name) || item.id!;
            const group = item.system.skill.group;
            const hasCustomImage = item.img && item.img !== 'icons/svg/item-bag.svg';

            const skill = DataDefaults.createData('skill_field', {
                id: item.id,
                name: item.name,
                img: hasCustomImage ? item.img : '',
                label: SkillNamingFlow.localizeSkillName(item.name),
                base: item.system.skill.rating,
                description: item.system.description.value,
                attribute: item.system.skill.attribute,
                limit: item.system.skill.limit.attribute,
                canDefault: item.system.skill.defaulting,
                requirement: item.system.skill.requirement,
                specs: item.system.skill.specializations.map(spec => spec.name),
                group
            });

            switch (item.system.skill.category) {
                case 'active':
                    SkillFieldFlow.addSkill(skills.active, skill, key);
                    break;
                case 'language':
                    SkillFieldFlow.addSkill(skills.language, skill, key);
                    break;
                case 'knowledge':
                    const knowledgeType = item.system.skill.knowledgeType as KnowledgeSkillCategory;
                    SkillFieldFlow.addSkill(skills.knowledge[knowledgeType], skill, key);
                    break;
            }
        }

        return skills;
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
