import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';
import {SR5} from "../../../config";
import ActorTypesData = Shadowrun.ShadowrunActorDataData;

export class SkillsPrep {
    /**
     * Prepare actor data for skills
     */
    static prepareSkills(system: ActorTypesData) {
        const { language, active, knowledge } = system.skills;
        if (language) {
            if (!language.value) {
                language.value = {};
            }

            // language.value is defined as an array in template.json
            // However what we actually want here is an object, so we set it manually
            // The same is done for the other knowledge skillgroups 'value' properties below
            if (Array.isArray(language.value) && language.value.length == 0) {
                language.value = {};
            }

            language.attribute = 'intuition';
        }

        // function that will set the total of a skill correctly
        const prepareSkill = (skill) => {
            // skill.mod = [];
            if (!skill.base) skill.base = 0;
            if (skill.bonus?.length) {
                for (let bonus of skill.bonus) {
                    skill.mod = PartsList.AddUniquePart(skill.mod, bonus.key, Number(bonus.value));
                }
            }
            skill.value = Helpers.calcTotal(skill);

            // Older Chummer imports miss some fields.
            _mergeWithMissingSkillFields(skill);
        };

        // setup active skills
        for (const skill of Object.values(active)) {
            if (!skill.hidden) {
                prepareSkill(skill);
            }
        }

        const entries = Object.entries(system.skills.language.value);
        // remove entries which are deleted TODO figure out how to delete these from the data
        entries.forEach(([key, val]: [string, { _delete?: boolean }]) => val._delete && delete system.skills.language.value[key]);

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
            skillValue.label = SR5.activeSkills[skillKey];
        }
    }
}

/** Just a quick, semi hacky way of setting up a complete skill data structure, while still allowing
 *  fields to be added at need.
 *
 * @param givenSkill
 * @return merge default skill fields with fields of the given field, only adding new fields in the process.
 */
export const _mergeWithMissingSkillFields = (givenSkill) => {
    // Only the absolute most necessary fields, not datatype complete to SkillField
    const template = {
        name: "",
        base: "",
        value: 0,
        attribute: "",
        mod: [],
        specs: [],
        hidden: false
    };

    // Use mergeObject to reserve original object instance in case replacing it
    // causes problems down the line with active skills taken from a preexisting
    // data structure.
    // overwrite false to prohibit existing values to be overwritten with empty values.
    mergeObject(givenSkill, template, {overwrite: false});
}