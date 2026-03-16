import { SR5Item } from '@/module/item/SR5Item';
import { SR5Actor } from '../SR5Actor';
import { SkillNamingFlow } from '../../flows/SkillNamingFlow';

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

            const skillUpdate: Record<string, unknown> = {};
            let hasChanges = false;

            if ((skillItem.system.skill.group ?? '') !== group) {
                skillUpdate.group = group;
                hasChanges = true;
            }

            if (groupRating !== undefined && skillItem.system.skill.rating !== groupRating) {
                skillUpdate.rating = groupRating;
                hasChanges = true;
            }

            if (!hasChanges) continue;
            updates.push({
                _id: skillItem.id,
                system: {
                    skill: skillUpdate,
                },
            } as Item.UpdateData);
        }

        if (updates.length > 0) {
            await actor.updateEmbeddedDocuments('Item', updates);
        }
    },

    async addGroupSkill(skill: SR5Item<'skill'>, name = '') {
        if (!skill.isType('skill')) return;

        const skills = skill.system.group.skills;
        skills.push(name);
        await skill.update({ system: { group: { skills } } });
        if (skill.actor) await SkillGroupFlow.syncSkillItemGroups(skill.actor);
    },

    async removeGroupSkill(skill: SR5Item<'skill'>, index: number) {
        if (!skill.isType('skill')) return;

        const skills = skill.system.group.skills;
        if (index < 0 || index >= skills.length) return;

        skills.splice(index, 1);
        await skill.update({ system: { group: { skills } } });
        if (skill.actor) await SkillGroupFlow.syncSkillItemGroups(skill.actor);
    },

    async changeGroupRating(skill: SR5Item<'skill'>, rating: number) {
        if (!skill.isType('skill') || skill.system.type !== 'group') return;

        await skill.update({ system: { group: { rating } } });
    },
};