import { SR5Item } from '@/module/item/SR5Item';
import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { Helpers } from '@/module/helpers';
import { SR5Actor } from '../actor/SR5Actor';
import { Translation } from '@/module/utils/strings';
import { SR5 } from '@/module/config';
import { SkillNamingFlow } from './SkillNamingFlow';

/**
 * Provides selection-list data for skill and skill group pickers on any sheet.
 */
export const SkillSelectionFlow = {
    async getSkillSelection(
        actor?: SR5Actor,
        options: { categories?: (keyof typeof SR5.skillCategories)[], selectedSkills?: string[] } = {}
    ) {
        const skills = await PackItemFlow.getPackSkills();

        for (const ownedSkill of actor?.itemsForType.get('skill') ?? []) {
            if (skills.find(skill => skill.name === ownedSkill.name)) continue;
            skills.push(ownedSkill as SR5Item<'skill'>);
        }

        const sheetSkills: Record<string, Translation> = {};
        for (const skill of skills) {
            if (options.categories && !options.categories.includes(skill.system.skill.category)) continue;
            if (Object.hasOwn(sheetSkills, skill.name)) continue;

            sheetSkills[skill.name] = SkillNamingFlow.localizeSkillName(skill.name) as Translation;
        }

        for (const selectedSkill of options.selectedSkills ?? []) {
            if (!selectedSkill || Object.hasOwn(sheetSkills, selectedSkill)) continue;
            sheetSkills[selectedSkill] = SkillNamingFlow.localizeSkillName(selectedSkill) as Translation;
        }

        return Helpers.sortConfigValuesByTranslation(sheetSkills);
    },

    async getSkillgroupSelection(actor?: SR5Actor) {
        const skillgroups = await PackItemFlow.getPackSkillgroups();

        for (const ownedSkill of actor?.itemsForType.get('skill') ?? []) {
            if (!skillgroups.find(skill => skill.name === ownedSkill.name)) continue;
            skillgroups.push(ownedSkill as SR5Item<'skill'>);
        }

        const sheetGroups: Record<string, Translation> = {};
        for (const group of skillgroups) {
            if (Object.hasOwn(sheetGroups, group.name)) continue;
            sheetGroups[group.name] = SkillNamingFlow.localizeSkillgroupName(group.name) as Translation;
        }

        return Helpers.sortConfigValuesByTranslation(sheetGroups);
    },
};
