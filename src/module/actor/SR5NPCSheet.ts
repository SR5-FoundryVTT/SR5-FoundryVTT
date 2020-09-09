import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import { SR5ActorSheet } from "./SR5ActorSheet";
import ActorAttribute = Shadowrun.ActorAttribute;
import {Helpers} from "../helpers";
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

        this.extendAttributesData(data);

        //@ts-ignore
        return data;
    }

    extendAttributesData(data: SR5ActorSheetData) {
        const {attributes} = data.data;
        //@ts-ignore
        Object.values(attributes).forEach(attribute => {
            console.error(Helpers.shortenAttributeLocalization(attribute.label));
        });
    }
}