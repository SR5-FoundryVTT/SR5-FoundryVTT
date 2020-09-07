import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import { SR5ActorSheet } from "./SR5ActorSheet";

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
        //@ts-ignore
        data.data.skillPool = {};
        //@ts-ignore
        Object.entries(data.data.skills.active).forEach(([sid, skill]) => {
            const attribute = data.data.attributes[skill.attribute];
            const pool = (skill.canDefault ? -1 : skill.value) + attribute.value;
            const newSkill = {...skill, pool};
            //@ts-ignore
            data.data.skillPool[sid] = newSkill;
        })
        //@ts-ignore
        // console.error(Object.values(data.data.skills.active));
        console.error(data);
        return data;
    }
}