import { SR5Actor } from '@/module/actor/SR5Actor';
import { SkillGroupFlow } from '@/module/actor/flows/SkillGroupFlow';
import { SkillNamingFlow } from '@/module/flows/SkillNamingFlow';
import { SR5Item } from '../SR5Item';

export const SkillItemFlow = {
    /**
     * Build a category + skill name id, for easy cross category comparison.
     * @param name Skill name
     * @param category Skill category
     */
    skillNameByCategoryKey(name: string, category?: string) {
        const skillKey = SkillNamingFlow.nameToKey(name);
        if (!skillKey) return '';

        return `${skillKey}:${category ?? ''}`;
    },

    /**
     * Determine if given item is an owned skill item.
     * @param item Item data
     * @returns True if the item is an owned skill item, false otherwise
     */
    isSkillItem(item: Partial<Item.CreateData>) {
        return item.type === 'skill' && foundry.utils.getProperty(item, 'system.type') === 'skill';
    },

    /**
     * Return the category of a given skill item.
     * @param item Skill item data
     */
    getSkillCategory(item: Partial<Item.CreateData>) {
        return foundry.utils.getProperty(item, 'system.skill.category') as string | undefined;
    },

    /**
     * Get all skill items on this actor.
     * @param actor Actor to get skill items for
     */
    getOwnedSkillItems(actor: SR5Actor) {
        return actor.items.filter(item => SkillItemFlow.isSkillItem(item));
    },

    /**
     * Return a base name for a newly created skill item.
     *
     * @param item Item Data
     * @returns A localized base name for the skill.
     */
    getCreatedSkillNameBase(item: Partial<Item.CreateData>) {
        if (!item.type) return '';

        const label = CONFIG.Item.typeLabels[item.type];
        return label ? game.i18n.localize(label) : item.type;
    },

    /**
     * Generate the next available name for a newly created skill item.
     *
     * @param actor Actor to check for existing skill names
     * @param baseName Base name for the skill
     * @param pendingNames Names that are pending creation
     * @returns The next available skill name
     */
    nextCreatedSkillName(actor: SR5Actor, baseName: string, pendingNames: string[] = []) {
        const existingNames = SkillItemFlow.getOwnedSkillItems(actor)
            .map(item => item.name)
            .concat(pendingNames)
            .filter((name): name is string => typeof name === 'string' && name.length > 0);

        let counter = existingNames.filter(name => name.startsWith(baseName)).length + 1;
        let candidate = `${baseName} (${counter})`;

        while (existingNames.includes(candidate)) {
            counter += 1;
            candidate = `${baseName} (${counter})`;
        }

        return candidate;
    },

    /**
     * Generate the next available name for a newly created skill item based on the item data.
     *
     * @param actor Actor to check for existing skill names
     * @param item Item data
     * @param pendingNames Names that are pending creation
     * @returns The next available skill name
     */
    nextCreatedSkillNameForItem(actor: SR5Actor, item: Partial<Item.CreateData>, pendingNames: string[] = []) {
        const baseName = SkillItemFlow.getCreatedSkillNameBase(item);
        if (!baseName) return '';

        return SkillItemFlow.nextCreatedSkillName(actor, baseName, pendingNames);
    },

    /**
     * Add a skill specialization to the given skill item.
     * @param skill Skill item to add the specialization to
     * @param specialization Name of the specialization
     */
    async addSpecialization(skill: SR5Item<'skill'>, specialization = '') {
        if (!skill.isType('skill')) return;

        const specializations = skill.system.skill.specializations;
        specializations.push({ name: specialization });
        await skill.update({ system: { skill: { specializations } } });
    },

    /**
     * Remove a skill specialization from the given skill item. This is mostly used as a sheet helper, using indexes.
     * @param skill Skill item to remove the specialization from
     * @param index Index of the specialization to remove
     */
    async removeSpecialization(skill: SR5Item<'skill'>, index: number) {
        if (!skill.isType('skill')) return;

        const specializations = skill.system.skill.specializations;
        if (index < 0 || index >= specializations.length) return;

        specializations.splice(index, 1);
        await skill.update({ system: { skill: { specializations } } });
    },

    /**
     * Add a skill to the skill set item.
     * @param skillSet Skill Set item
     * @param name Name of the skill
     * @param specializations Specializations of the skill
     */
    async addSetSkill(skillSet: SR5Item<'skill'>, name = '', specializations = []) {
        if (!skillSet.isType('skill')) return;

        const skills = skillSet.system.set.skills;
        skills.push({ name, rating: 0, specializations });
        await skillSet.update({ system: { set: { skills } } });
    },

    /**
     * Remove a skill from the skill set item. This is mostly used as a sheet helper, using indexes.
     * @param skillSet Skill Set item
     * @param index Index of the skill to remove
     * @returns 
     */
    async removeSetSkill(skillSet: SR5Item<'skill'>, index: number) {
        if (!skillSet.isType('skill')) return;

        const skills = skillSet.system.set.skills;
        if (index < 0 || index >= skills.length) return;

        skills.splice(index, 1);
        await skillSet.update({ system: { set: { skills } } });
    },

    /**
     * Add a skill set skill specialization to the given skill item. This is mostly used as a sheet helper, using indexes.
     * @param skillSet The skillset item.
     * @param skillIndex Index of the skillset skill to add specialization to.
     * @param specialization Specialization name to add.
     */
    async addSetSkillSpecialization(skillSet: SR5Item<'skill'>, skillIndex: number, specialization = '') {
        if (!skillSet.isType('skill')) return;

        const skills = skillSet.system.set.skills;
        if (skillIndex < 0 || skillIndex >= skills.length) return;

        skills[skillIndex].specializations.push({ name: specialization });
        await skillSet.update({ system: { set: { skills } } });
    },

    /**
     * Remove a skill specialization from a skillset item skill. This is mostly used as a sheet helper, using indexes.
     * @param skillSet The skillset item.
     * @param skillIndex Index of the skillset skill to remove specialization from.
     * @param specializationIndex Index of the specialization to remove.
     */
    async removeSetSkillSpecialization(skillSet: SR5Item<'skill'>, skillIndex: number, specializationIndex: number) {
        if (!skillSet.isType('skill')) return;

        const skills = skillSet.system.set.skills;
        if (skillIndex < 0 || skillIndex >= skills.length) return;

        const specializations = skills[skillIndex].specializations;
        if (specializationIndex < 0 || specializationIndex >= specializations.length) return;

        specializations.splice(specializationIndex, 1);
        await skillSet.update({ system: { set: { skills } } });
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
            await SkillItemFlow.changeGroupRating(skill, rating);
        }
    },
    
    async addGroupSkill(skill: SR5Item<'skill'>, name = '') {
        if (!skill.isType('skill')) return;

        const skills = skill.system.group.skills;
        skills.push(name);
        await skill.update({ system: { group: { skills } } });
        if (skill.actor) await SkillGroupFlow.syncSkillItemGroups(skill.actor);
    },

    async changeGroupRating(skill: SR5Item<'skill'>, rating: number) {
        if (!skill.isType('skill') || skill.system.type !== 'group') return;

        await skill.update({ system: { group: { rating } } });
    },

    async removeGroupSkill(skill: SR5Item<'skill'>, index: number) {
        if (!skill.isType('skill')) return;

        const skills = skill.system.group.skills;
        if (index < 0 || index >= skills.length) return;

        skills.splice(index, 1);
        await skill.update({ system: { group: { skills } } });
        if (skill.actor) await SkillGroupFlow.syncSkillItemGroups(skill.actor);
    },
};