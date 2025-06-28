import { DataDefaults } from "src/module/data/DataDefaults";
import { SR5 } from "../../../config";
import { Helpers } from '../../../helpers';
import { PartsList } from '../../../parts/PartsList';
import { SkillFieldType } from 'src/module/types/template/Skills';

export class SkillsPrep {
    /**
     * Prepare missing skill data as early in during data preparation as possible.
     * 
     * template.json is incomplete, so we need to fill in the missing fields.
     * This is mostly a legacy design and should be fixed in the future when DataModel's are used.
     * 
     * NOTE: Foundry also calls the prepareData multiple times with incomplete source data, causing some value properties to be missing.
     * @param system 
     */
    static prepareSkillData(system: Actor.SystemOfType<'character' | 'critter' | 'ic' | 'spirit' | 'sprite' | 'vehicle'>) {
        const { language, active, knowledge } = system.skills;

        // Active skills aren't grouped and can be prepared skill by skill.
        // Foundry Vtt types currently do not support the `TypedObjectField` type, so we need to cast it.
        Object.values(active as Record<string, SkillFieldType>)
            .forEach((skill) => { DataDefaults.createData('skill_field', skill)} );

        // Language skills aren't group, but might lack the value property.
        if (language.value)
            Object.values(language.value as Record<string, SkillFieldType>).forEach((skill) => { DataDefaults.createData('skill_field', skill)} );

        // Knowledge skills are groupd and might also lack the value property.
        Object.values(knowledge).forEach((group) => {
            if (group.value)
                Object.values(group.value as Record<string, SkillFieldType>).forEach((skill) => { DataDefaults.createData('skill_field', skill)} );
        });
    }

    /**
     * Prepare actor data for skills
     */
    static prepareSkills(system: Actor.SystemOfType<'character' | 'critter' | 'ic' | 'spirit' | 'sprite' | 'vehicle'>) {
        const { language, active, knowledge } = system.skills;
        if (language) {
            language.attribute = 'intuition';
        }

        // function that will set the total of a skill correctly
        const prepareSkill = (skill) => {
            if (!skill.base) skill.base = 0;
            if (skill.bonus?.length) {
                for (const bonus of skill.bonus) {
                    skill.mod = PartsList.AddUniquePart(skill.mod, bonus.key, Number(bonus.value));
                }
            }
            skill.value = Helpers.calcTotal(skill);
        };

        // setup active skills
        // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
        for (const skill of Object.values(active as Record<string, SkillFieldType>)) {
            if (!skill.hidden) {
                prepareSkill(skill);
            }
        }

        // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
        const entries = Object.entries(system.skills.language.value as Record<string, SkillFieldType>);
        // remove entries which are deleted TODO figure out how to delete these from the data
        entries.forEach(([key, val]: [string, { _delete?: boolean }]) => val._delete && delete system.skills.language.value[key]);
        
        // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
        for (const skill of Object.values(language.value as Record<string, SkillFieldType>)) {
            prepareSkill(skill);
            skill.attribute = 'intuition';
        }

        // setup knowledge skills
        for (const [, group] of Object.entries(knowledge)) {

            if(!group?.value) {
                continue;
            }

            // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
            const entries = Object.entries(group.value as Record<string, SkillFieldType>);    
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

        // FVTT types currently do not support the `TypedObjectField` type, so we need to cast it.
        for (const [skillKey, skillValue] of Object.entries(active as Record<string, SkillFieldType>)) {
            skillValue.label = SR5.activeSkills[skillKey];
        }
    }
}
