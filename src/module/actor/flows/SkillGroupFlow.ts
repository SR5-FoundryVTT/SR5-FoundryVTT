import { SR5Item } from '@/module/item/SR5Item';
import { SR5Actor } from '../SR5Actor';
import { SkillNamingFlow } from '../../flows/SkillNamingFlow';

/**
 * Coordinates skill group item behavior for actors.
 */
export const SkillGroupFlow = {
    buildGroupedSkillIndex(groupItems: Array<SR5Item<'skill'> | Item.CreateData>) {
        const groupedSkills = new Map<string, { name: string, rating: number }>();

        for (const groupItem of groupItems) {
            const groupData = SkillGroupFlow.getGroupData(groupItem);
            if (!groupData) continue;

            for (const groupedSkillName of groupData.skills) {
                const groupedSkillKey = SkillNamingFlow.nameToKey(groupedSkillName);
                if (!groupedSkillKey || groupedSkills.has(groupedSkillKey)) continue;

                groupedSkills.set(groupedSkillKey, {
                    name: groupData.name,
                    rating: groupData.rating,
                });
            }
        }

        return groupedSkills;
    },

    getGroupData(groupItem: SR5Item<'skill'> | Item.CreateData) {
        if (groupItem instanceof SR5Item) {
            if (!groupItem.isType('skill') || groupItem.system.type !== 'group') return null;

            return {
                name: groupItem.name,
                skills: groupItem.system.group.skills,
                rating: groupItem.system.group.rating,
            };
        }

        if (groupItem.type !== 'skill') return null;
        if (foundry.utils.getProperty(groupItem, 'system.type') !== 'group') return null;

        return {
            name: groupItem.name,
            skills: foundry.utils.getProperty(groupItem, 'system.group.skills') as string[] ?? [],
            rating: foundry.utils.getProperty(groupItem, 'system.group.rating') as number ?? 0,
        };
    },

    async syncSkillItemGroups(actor: SR5Actor) {
        const skillItems: SR5Item<'skill'>[] = [];
        const groupItems: SR5Item<'skill'>[] = [];

        for (const item of actor.itemsForType?.get('skill') ?? []) {
            if (!item.isType('skill')) continue;

            if (item.system.type === 'skill') skillItems.push(item);
            if (item.system.type === 'group') groupItems.push(item);
        }

        const groupedSkills = SkillGroupFlow.buildGroupedSkillIndex(groupItems);

        const updates: Item.UpdateData[] = [];
        for (const skillItem of skillItems) {
            const skillKey = SkillNamingFlow.nameToKey(skillItem.name);
            const groupedSkill = groupedSkills.get(skillKey);
            const group = groupedSkill?.name ?? '';
            const groupRating = groupedSkill?.rating;

            const skillUpdate: { group?: string, rating?: number } = {};

            if ((skillItem.system.skill.group ?? '') !== group) {
                skillUpdate.group = group;
            }

            if (groupRating !== undefined && skillItem.system.skill.rating !== groupRating) {
                skillUpdate.rating = groupRating;
            }

            if (!Object.keys(skillUpdate).length) continue;
            updates.push({
                _id: skillItem.id,
                system: {
                    skill: skillUpdate,
                },
            });
        }

        if (updates.length > 0) {
            await actor.updateEmbeddedDocuments('Item', updates);
        }
    },
};
