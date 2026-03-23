import { SR5Item } from '@/module/item/SR5Item';
import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { Helpers } from '@/module/helpers';
import { SR5Actor } from '../actor/SR5Actor';
import { Translation } from '@/module/utils/strings';
import { SR5 } from '@/module/config';
import { SkillNamingFlow } from './SkillNamingFlow';

interface GetSkillSelectionOptions {
    categories?: (keyof typeof SR5.skillCategories)[];
    selectedSkills?: string[];
    valueType?: 'name' | 'key';
}

/**
 * Provides selection-list data for skill and skill group pickers on any sheet.
 */
export const SkillSelectionFlow = {
    /**
     * Create a list for skill selection inputs.
     * 
     * NOTE: some selections need skill names (skill groups, skill sets) and other need keys (skillField based selections).
     * @param actor The actor for which to generate the skill selection list.
     * @param options Additional options for filtering and formatting the skill selection list.
     * @param options.categories If provided, only skills belonging to the given categories will be included in the selection list.
     * @param options.selectedSkills If provided, these skills will be included in the selection list even if they aren't included in pack or actor.
     * @param options.valueType Define whether the selection values should be skill names or keys.
     * @returns A sorted list of skills suitable for use in selection inputs.
     */
    async getSkillSelection(
        actor?: SR5Actor,
        options: GetSkillSelectionOptions = {}
    ) {
        const skills = await PackItemFlow.getPackSkills();
        const getSelectionValue = (skillName: string) =>
            options.valueType === 'key' ? SkillNamingFlow.nameToKey(skillName) : skillName;

        for (const ownedSkill of actor?.itemsForType.get('skill') ?? []) {
            if (skills.find(skill => skill.name === ownedSkill.name)) continue;
            skills.push(ownedSkill as SR5Item<'skill'>);
        }

        const sheetSkills: Record<string, Translation> = {};
        for (const skill of skills) {
            if (options.categories && !options.categories.includes(skill.system.skill.category)) continue;
            const selectionValue = getSelectionValue(skill.name);
            if (Object.hasOwn(sheetSkills, selectionValue)) continue;

            sheetSkills[selectionValue] = SkillNamingFlow.localizeSkillName(skill.name) as Translation;
        }

        for (const selectedSkill of options.selectedSkills ?? []) {
            const selectedSkillKey = getSelectionValue(selectedSkill);
            if (!selectedSkillKey || Object.hasOwn(sheetSkills, selectedSkillKey) || Object.hasOwn(sheetSkills, selectedSkill)) continue;

            const selectedSkillName = skills.find(skill => skill.name === selectedSkill || SkillNamingFlow.nameToKey(skill.name) === SkillNamingFlow.nameToKey(selectedSkill))?.name
                ?? actor?.getSkill(selectedSkill)?.name
                ?? selectedSkill;

            sheetSkills[selectedSkillKey] = SkillNamingFlow.localizeSkillName(selectedSkillName) as Translation;
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
