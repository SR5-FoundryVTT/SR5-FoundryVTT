import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SkillRules } from "../../rules/SkillRules";
import { PartsList } from "../../parts/PartsList";
import { FLAGS, SYSTEM_NAME } from "../../constants";
import { KnowledgeSkillCategory, SkillFieldType } from "src/module/types/template/Skills";
import { SR5Item } from "@/module/item/SR5Item";
import { DataDefaults } from "@/module/data/DataDefaults";
import { Helpers } from "@/module/helpers";
import { SR5Actor } from "../SR5Actor";
import { SkillRollOptions } from "@/module/types/rolls/ActorRolls";

// A skill storage structure for easier access to character skill items.
export interface Skills {
    // quick access based on name and label.
    // TODO: tamif - these must be removed, as name / locale isn't unquie across skill types.
    named: Map<string, SR5Item<'skill'>>
    localized: Map<string, SR5Item<'skill'>>
    // sorted lists for sheet display.
    active: SR5Item<'skill'>[]
    language: SR5Item<'skill'>[]
    knowledge: {
        academic: SR5Item<'skill'>[]
        professional: SR5Item<'skill'>[]
        street: SR5Item<'skill'>[]
        interests: SR5Item<'skill'>[]
    }
};

/**
 * Handle functionality between actors and their skills.
 */
// TODO: tamif - refactor into object style
export class SkillFlow {

    static isCustomSkill(skill: SkillFieldType): boolean {
        return skill.name !== undefined && skill.name !== '';
    }

    static isLegacySkill(skill: SkillFieldType): boolean {
        return !SkillFlow.isCustomSkill(skill);
    }

    /**
     * Derive actor skill data from their skill items.
     * 
     * @param items Skill items to transform. It must only be skill items.
     * @returns 
     */
    static prepareActorSkills(items: SR5Item<'skill'>[]) {
        const skills = {
            active: {},
            language: {},
            knowledge: {
                street: {},
                academic: {},
                professional: {},
                interests: {},
            }
        }

        const skillItems = items.filter(item => item.system.type === 'skill');

        for (const item of skillItems) {
            if (!item.isType('skill')) continue;

            // Name is user input but used for json storage here. It should match
            // overall naming scheme.
            const key = SkillFlow.nameToKey(item.name) || item.id!;

            const skill = DataDefaults.createData("skill_field", {
                id: item.id,
                name: item.name,
                // TODO: tamif - check for translation support
                label: SkillFlow.localizeSkillName(item.name),
                base: item.system.skill.rating,
                description: item.system.description.value,
                attribute: item.system.skill.attribute,
                canDefault: item.system.skill.defaulting,
            });

            switch (item.system.skill.category) {
                case 'active':
                    SkillFlow.addSkill(skills.active, skill, key);
                    break;
                case 'language':
                    SkillFlow.addSkill(skills.language, skill, key);

                    break;
                case 'knowledge':
                    const knowledgeType = item.system.skill.knowledgeType as KnowledgeSkillCategory;
                    SkillFlow.addSkill(skills.knowledge[knowledgeType], skill, key);
                    break;
            }
        }

        // TODO: tamif - implement sorting again

        return skills;
    }

    /**
     * Add a single skill to the list of skills within system.skills.
     * 
     * We have to check for certain edge cases here, as we deal with user input.
     */
    private static addSkill(skills: Record<string, SkillFieldType>, skill: SkillFieldType, key: string) {
        if (Object.hasOwn(skills, key)) {
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.SkillAlreadyExists'));
            return;
        }
        skills[key] = skill;
    }

    /**
     * Alphabetically sort skills either by their translated label. Should a skill not have one, use the name as a
     * fallback.
     *
     * Sorting should be aware of UTF-8, however please blame JavaScript if it's not. :)
     *
     * @param skills
     * @param asc Set to true for ascending sorting order and to false for descending order.
     * @return Sorted Skills given by the skills parameter
     */
    static sortSkills(skills: SR5Item<'skill'>[], asc = true) {
        // Filter entries instead of values to have a store of ids for easy rebuild.
        const sortedSkills = skills.sort((a, b) => {
            const comparatorA = SkillFlow.localizeSkillName(a.name);
            const comparatorB = SkillFlow.localizeSkillName(b.name);
            // Use String.localeCompare instead of the > Operator to support other alphabets.
            if (asc)
                return comparatorA.localeCompare(comparatorB) === 1 ? 1 : -1;
            else
                return comparatorA.localeCompare(comparatorB) === 1 ? -1 : 1;
        });

        const sortedSkillsObject = {};
        sortedSkills.forEach(skill => {
            const translated = SkillFlow.localizeSkillName(skill.name);
            sortedSkillsObject[translated] = skill;
        });

        return sortedSkillsObject;
    }

    static nameToKey(name: string) {
        if (!name) return '';
        return name.replace(' ', '_').toLowerCase();
    }

    /**
     * Translate the skill name into a localized version, if possible.
     */
    static localizeSkillName(name: string) {
        return Helpers.localizeName(name, 'SR5.Skill');
    }

    /**
     * Prepare a default data structure for skill items that allows to
     * better retrieve them compared to a flat skill item list.
     */
    static getDefaultActorSkills(): Skills {
        return {
            // quick access based on name and label.
            named: new Map(),
            localized: new Map(),
            // sorted lists for sheet display.
            active: [],
            language: [],
            knowledge: {
                academic: [],
                professional: [],
                street: [],
                interests: [],
            }
        };
    }

    /**
     * Add a new specialization to the given skill.
     * @param skill A skill item to which the specialization should be added.
     * @param specialization The specialization name to add.
     */
    static async addSpecialization(skill: SR5Item<'skill'>, specialization = '') {
        if (!skill.isType('skill')) return;

        const specializations = skill.system.skill.specializations;
        specializations.push({ name: specialization });
        await skill.update({ system: { skill: { specializations } } });
    }

    /**
     * Remove a specialization from the given skill.
     * @param skill A skill item to remove the specialization from.
     * @param index The specialization index to remove.
     */
    static async removeSpecialization(skill: SR5Item<'skill'>, index: number) {
        if (!skill.isType('skill')) return;

        const specializations = skill.system.skill.specializations;
        if (index < 0 || index >= specializations.length) return;

        specializations.splice(index, 1);
        await skill.update({ system: { skill: { specializations } } });
    }

    /**
     * Add a new skill entry to the skill group.
     * @param skill A skill item of type 'group'.
     * @param name The skill name to add.
     */
    static async addGroupSkill(skill: SR5Item<'skill'>, name = '') {
        if (!skill.isType('skill')) return;

        const skills = skill.system.group.skills;
        skills.push(name);
        await skill.update({ system: { group: { skills } } });
    }

    /**
     * Remove a skill entry from the skill group.
     * @param skill A skill item of type 'group'.
     * @param index The index of the skill to remove.
     */
    static async removeGroupSkill(skill: SR5Item<'skill'>, index: number) {
        if (!skill.isType('skill')) return;

        const skills = skill.system.group.skills;
        if (index < 0 || index >= skills.length) return;

        skills.splice(index, 1);
        await skill.update({ system: { group: { skills } } });
    }

    /**
     * Add a new skill entry to the skill set.
     * @param skill A skill item of type 'set'.
     * @param name The skill name to add.
     */
    static async addSetSkill(skill: SR5Item<'skill'>, name = '') {
        if (!skill.isType('skill')) return;

        const skills = skill.system.set.skills;
        skills.push({ name, rating: 0 });
        await skill.update({ system: { set: { skills } } });
    }

    /**
     * Remove a skill entry from the skill set.
     * @param skill A skill item of type 'set'.
     * @param index The index of the skill to remove.
     */
    static async removeSetSkill(skill: SR5Item<'skill'>, index: number) {
        if (!skill.isType('skill')) return;

        const skills = skill.system.set.skills;
        if (index < 0 || index >= skills.length) return;

        skills.splice(index, 1);
        await skill.update({ system: { set: { skills } } });
    }

    /**
     * Add a new group entry to the skill set.
     * @param skill A skill item of type 'set'.
     * @param name The group name to add.
     */
    static async addSetGroup(skill: SR5Item<'skill'>, name = '') {
        if (!skill.isType('skill')) return;

        const groups = skill.system.set.groups;
        groups.push({ name, rating: 0 });
        await skill.update({ system: { set: { groups } } });
    }

    /**
     * Remove a group entry from the skill set.
     * @param skill A skill item of type 'set'.
     * @param index The index of the group to remove.
     */
    static async removeSetGroup(skill: SR5Item<'skill'>, index: number) {
        if (!skill.isType('skill')) return;

        const groups = skill.system.set.groups;
        if (index < 0 || index >= groups.length) return;

        groups.splice(index, 1);
        await skill.update({ system: { set: { groups } } });
    }

    /**
     * Add default skill items to the given actor, based on their type.
     * 
     * This can be called anytime, however it's primarily used during actor creation.
     * 
     * @param actor Actor to add skill items to.
     */
    static async addSkillItems(actor: SR5Actor, data: Actor.CreateData) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (data.type !== 'character' && data.type !== 'critter') return;
       
        try {
            const packSkills = await PackItemFlow.getPackSkills();
            if (packSkills.length > 0) {
                const allItems = packSkills.map(skill => skill.toObject());
                actor.updateSource({ items: allItems });
                console.log(`Shadowrun 5e | Added ${allItems.length} skills from pack to source data`);
            }
        } catch (error) {
            console.error('Shadowrun 5e | Failed to add skills from pack:', error);
        }
    }
}
