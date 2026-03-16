import { Helpers } from '@/module/helpers';

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