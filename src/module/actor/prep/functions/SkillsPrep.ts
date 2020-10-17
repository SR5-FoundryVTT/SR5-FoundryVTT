import SR5ActorData = Shadowrun.SR5ActorData;
import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';

export class SkillsPrep {
    /**
     * Prepare actor data for skills
     */
    static prepareSkills(data: SR5ActorData) {
        const { language, active, knowledge } = data.skills;
        if (language) {
            if (!language.value) language.value = {};
            language.attribute = 'intuition';
        }

        // function that will set the total of a skill correctly
        const prepareSkill = (skill) => {
            skill.mod = [];
            if (!skill.base) skill.base = 0;
            if (skill.bonus?.length) {
                for (let bonus of skill.bonus) {
                    skill.mod = PartsList.AddUniquePart(skill.mod, bonus.key, Number(bonus.value));
                }
            }
            skill.value = Helpers.calcTotal(skill);
        };

        // setup active skills
        for (const skill of Object.values(active)) {
            if (!skill.hidden) {
                prepareSkill(skill);
            }
        }

        const entries = Object.entries(data.skills.language.value);
        // remove entries which are deleted TODO figure out how to delete these from the data
        entries.forEach(([key, val]: [string, { _delete?: boolean }]) => val._delete && delete data.skills.language.value[key]);

        for (let skill of Object.values(language.value)) {
            prepareSkill(skill);
            skill.attribute = 'intuition';
        }

        // setup knowledge skills
        for (let [, group] of Object.entries(knowledge)) {
            const entries = Object.entries(group.value);
            // remove entries which are deleted TODO figure out how to delete these from the data
            group.value = entries
                .filter(([, val]) => !val._delete)
                .reduce((acc, [id, skill]) => {
                    prepareSkill(skill);

                    // set the attribute on the skill
                    skill.attribute = group.attribute;
                    acc[id] = skill;
                    return acc;
                }, {});
        }

        // skill labels
        for (let [skillKey, skillValue] of Object.entries(active)) {
            skillValue.label = CONFIG.SR5.activeSkills[skillKey];
        }
    }
}
