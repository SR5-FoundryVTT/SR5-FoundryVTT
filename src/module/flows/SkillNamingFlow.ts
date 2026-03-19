import { Helpers } from '@/module/helpers';

/**
 * Utility flow for converting skill, skill group, and skill set names into
 * stable keys and localized labels. Use this flow wherever skill-related data
 * needs a shared naming convention for storage, lookup, sorting, or UI display.
 */
export const SkillNamingFlow = {
    nameToKey(name: string) {
        if (!name) return '';
        return name.replace(' ', '_').toLowerCase();
    },

    localizeSkillName(name: string) {
        return Helpers.localizeName(name, 'SR5.Skill');
    },

    localizeSkillgroupName(name: string) {
        return Helpers.localizeName(name, 'SR5.Skill.Groups');
    },

    localizeSkillsetName(name: string) {
        return Helpers.localizeName(name, 'SR5.Skill.Sets');
    },
};