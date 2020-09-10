import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import { SR5ActorSheet } from "./SR5ActorSheet";
import ActorAttribute = Shadowrun.ActorAttribute;
import {Helpers} from "../helpers";
import Skills = Shadowrun.Skills;
/* This is dev todos that should be done before it's going live. If you, a trusted user, can read this, please heckle
    taM#9507 lovingly about it.

TODO: Allow filtering to search all skill types.
TODO: Add shortend and ultraShorted localizations to attributes for BOD and B
 */
export class SR5NPCSheet extends SR5ActorSheet {
    static template: string = "systems/shadowrun5e/dist/templates/npc/npc.html";

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ['sr5', 'sheet', 'actor'],
            template: SR5NPCSheet.template
        })
    }

    getData() {
        const data = super.getData();
        console.error('data', data);
        //@ts-ignore
        return data;
    }

    _filterSkills(data: SR5ActorSheetData, skills: typeof Skills) {
        const filteredSkills = {};
        for (let [key, skill] of Object.entries(skills)) {
            // if filter isn't empty, we are doing custom filtering
            if (this._filters.skills !== '') {
                if (this._doesSkillContainText(key, skill, this._filters.skills)) {
                    filteredSkills[key] = skill;
                }
                // general check if we aren't filtering
            } else if (
                (skill.value > 0 || this._shownUntrainedSkills) &&
                !(this._isSkillMagic(key, skill) && data.data.special !== 'magic') &&
                !(skill.attribute === 'resonance' && data.data.special !== 'resonance')
            ) {
                filteredSkills[key] = skill;
            }
        }
        Helpers.orderKeys(filteredSkills);
        return filteredSkills
    }

    _prepareSkills(data: SR5ActorSheetData) {
        data.data.skills.active = this._filterSkills(data, data.data.skills.active);
        Object.keys(data.data.skills.knowledge).forEach(category => {
            data.data.skills.knowledge[category].value = this._filterSkills(data, data.data.skills.knowledge[category].value);
        });
        data.data.skills.language.value = this._filterSkills(data, data.data.skills.language.value);
    }
}