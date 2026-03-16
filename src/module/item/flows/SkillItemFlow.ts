import { SR5Actor } from '@/module/actor/SR5Actor';
import { SkillGroupFlow } from '@/module/actor/flows/SkillGroupFlow';
import { SR5Item } from '../SR5Item';

export const SkillItemFlow = {
    async addSpecialization(skill: SR5Item<'skill'>, specialization = '') {
        if (!skill.isType('skill')) return;

        const specializations = skill.system.skill.specializations;
        specializations.push({ name: specialization });
        await skill.update({ system: { skill: { specializations } } });
    },

    async removeSpecialization(skill: SR5Item<'skill'>, index: number) {
        if (!skill.isType('skill')) return;

        const specializations = skill.system.skill.specializations;
        if (index < 0 || index >= specializations.length) return;

        specializations.splice(index, 1);
        await skill.update({ system: { skill: { specializations } } });
    },

    async addSetSkill(skill: SR5Item<'skill'>, name = '') {
        if (!skill.isType('skill')) return;

        const skills = skill.system.set.skills;
        skills.push({ name, rating: 0, specializations: [] });
        await skill.update({ system: { set: { skills } } });
    },

    async removeSetSkill(skill: SR5Item<'skill'>, index: number) {
        if (!skill.isType('skill')) return;

        const skills = skill.system.set.skills;
        if (index < 0 || index >= skills.length) return;

        skills.splice(index, 1);
        await skill.update({ system: { set: { skills } } });
    },

    async addSetSkillSpecialization(skill: SR5Item<'skill'>, skillIndex: number, specialization = '') {
        if (!skill.isType('skill')) return;

        const skills = skill.system.set.skills;
        if (skillIndex < 0 || skillIndex >= skills.length) return;

        skills[skillIndex].specializations.push({ name: specialization });
        await skill.update({ system: { set: { skills } } });
    },

    async removeSetSkillSpecialization(skill: SR5Item<'skill'>, skillIndex: number, specializationIndex: number) {
        if (!skill.isType('skill')) return;

        const skills = skill.system.set.skills;
        if (skillIndex < 0 || skillIndex >= skills.length) return;

        const specializations = skills[skillIndex].specializations;
        if (specializationIndex < 0 || specializationIndex >= specializations.length) return;

        specializations.splice(specializationIndex, 1);
        await skill.update({ system: { set: { skills } } });
    },

    async addSetGroup(skill: SR5Item<'skill'>, name = '') {
        if (!skill.isType('skill')) return;

        const groups = skill.system.set.groups;
        groups.push({ name, rating: 0 });
        await skill.update({ system: { set: { groups } } });
    },

    async removeSetGroup(skill: SR5Item<'skill'>, index: number) {
        if (!skill.isType('skill')) return;

        const groups = skill.system.set.groups;
        if (index < 0 || index >= groups.length) return;

        groups.splice(index, 1);
        await skill.update({ system: { set: { groups } } });
    },

    async changeSkillRating(actor: SR5Actor, skillId: string, rating: number) {
        const skill = actor.items.get(skillId);
        if (!skill?.isType('skill')) return;

        if (skill.system.type === 'skill') {
            await skill.update({ system: { skill: { rating } } });
            return;
        }

        if (skill.system.type === 'group') {
            await SkillGroupFlow.changeGroupRating(skill, rating);
        }
    },
};