import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SR5Actor } from '../SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { SkillNamingFlow } from '../../flows/SkillNamingFlow';
import { SkillGroupFlow } from './SkillGroupFlow';

/**
 * Provides actor specific skill set flow operations.
 */
export const SkillSetFlow = {
    skillNameByCategoryKey(name: string, category?: string) {
        const skillKey = SkillNamingFlow.nameToKey(name);
        if (!skillKey) return '';

        return `${skillKey}:${category ?? ''}`;
    },

    hasSkillWithSameNameAndCategory(actor: SR5Actor, name: string, category?: string) {
        const skillKey = SkillNamingFlow.nameToKey(name);
        if (!skillKey || !category) return false;

        if (category === 'active') {
            return Object.hasOwn(actor.system.skills.active, skillKey);
        }

        if (category === 'language') {
            return Object.hasOwn(actor.system.skills.language, skillKey);
        }

        if (category === 'knowledge') {
            for (const knowledgeSkills of Object.values(actor.system.skills.knowledge)) {
                if (Object.hasOwn(knowledgeSkills, skillKey)) return true;
            }
        }

        return false;
    },

    async removeSkillSet(actor: SR5Actor, skillsetUuid?: string) {
        if (!actor.system.skillset) return;
        if (!skillsetUuid) skillsetUuid = actor.system.skillset;

        const skillset = await fromUuid(skillsetUuid);
        if (!(skillset instanceof SR5Item)) return;
        if (!skillset?.isType('skill') || skillset.system.type !== 'set') return;

        const items: string[] = [];
        for (const setSkill of skillset.system.set.skills) {
            const item = actor.itemsForType.get('skill')?.find(skill => skill.name === setSkill.name);
            if (item) items.push(item.id!);
        }

        await actor.deleteEmbeddedDocuments('Item', items);
    },

    async applySkillSetToActor(actor: SR5Actor, skillSet: SR5Item<'skill'>, options: { useSource?: boolean } = {}) {
        if (!skillSet.isType('skill') || skillSet.system.type !== 'set') return;

        const skills = await PackItemFlow.getSkillsForSkillSet(skillSet);
        const groups = await PackItemFlow.getSkillGroupsForSkillSet(skillSet) as Item.CreateData[];
        const configuredSkillEntries = new Map(skillSet.system.set.skills.map(skill => [skill.name, skill]));
        const groupedSkillNames = SkillGroupFlow.buildGroupedSkillIndex(groups);

        const newSkillKeys = new Set<string>();
        const items = [...skills, ...groups].flatMap(item => {
            const itemData = foundry.utils.deepClone(item) as Item.CreateData & { _id?: string };
            delete itemData._id;

            if (itemData.type === 'skill' && foundry.utils.getProperty(itemData, 'system.type') === 'skill') {
                if (!itemData.name) return [];

                const skillCategory = foundry.utils.getProperty(itemData, 'system.skill.category') as string | undefined;
                const skillNameByCategoryKey = SkillSetFlow.skillNameByCategoryKey(itemData.name, skillCategory);
                if (SkillSetFlow.hasSkillWithSameNameAndCategory(actor, itemData.name, skillCategory) || newSkillKeys.has(skillNameByCategoryKey)) {
                    return [];
                }
                newSkillKeys.add(skillNameByCategoryKey);

                const skillKey = SkillNamingFlow.nameToKey(itemData.name);
                const groupedSkill = groupedSkillNames.get(skillKey);
                const skillGroup = groupedSkill?.name ?? '';
                const configuredSkill = configuredSkillEntries.get(itemData.name);
                foundry.utils.setProperty(itemData, 'system.skill.group', skillGroup);
                if (groupedSkill) {
                    foundry.utils.setProperty(itemData, 'system.skill.rating', groupedSkill.rating);
                }

                if (configuredSkill) {
                    const existingSpecializations = foundry.utils.getProperty(itemData, 'system.skill.specializations') as { name: string }[] | undefined;
                    const mergedSpecializations = [...(existingSpecializations ?? [])];

                    for (const specialization of configuredSkill.specializations) {
                        if (mergedSpecializations.some(existing => existing.name === specialization.name)) continue;
                        mergedSpecializations.push(foundry.utils.deepClone(specialization));
                    }

                    foundry.utils.setProperty(itemData, 'system.skill.specializations', mergedSpecializations);
                }
            }

            return [itemData];
        });

        if (options.useSource) {
            actor.updateSource({ items, system: { skillset: skillSet.uuid } });
            return;
        }

        await actor.createEmbeddedDocuments('Item', items);
        await actor.update({ system: { skillset: skillSet.uuid } });
        console.log(`Shadowrun 5e | Added ${skills.length} skills and ${groups.length} skill groups from pack to actor ${actor.name}`);
    },
};
