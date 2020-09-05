import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import { SR5ActorSheet } from "./SR5ActorSheet";

export class SR5NPCSheet extends SR5ActorSheet {
    static template: string = "systems/shadowrun5e/dist/templates/actor/character.html";
    
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: SR5NPCSheet.template
        })
    }

    getData() {
        const data = super.getData();
        return data;
    }
}