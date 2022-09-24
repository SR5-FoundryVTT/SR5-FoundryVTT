import {SR5BaseActorSheet} from "./SR5BaseActorSheet";
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import MarkedDocument = Shadowrun.MarkedDocument;


export interface CharacterSheetData extends SR5ActorSheetData {
    awakened: boolean
    emerged: boolean
    woundTolerance: number
    markedDocuments: MarkedDocument[]
    handledItemTypes: string[]
    inventory: Record<string, any>
}


export class SR5CharacterSheet extends SR5BaseActorSheet {
    /**
     * Character actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    getHandledItemTypes(): string[] {
        let itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'program',
            'sin',
            'lifestyle',
            'contact',
            'spell',
            'adept_power',
            'complex_form',
            'quality',
            'critter_power'
        ];
    }

    /**
     * Character actors will always show these item types.
     *
     * For more info see into super.getInventoryItemTypes jsdoc.
     *
     * @returns An array of item types from the template.json Item section.
     */
    getInventoryItemTypes(): string[] {
        const itemTypes = super.getInventoryItemTypes();

        return [
            ...itemTypes,
            'weapon',
            'ammo',
            'armor',
            'bioware',
            'cyberware',
            'device',
            'equipment',
            'modification'
        ];
    }

    async getData(options) {
        const data = await super.getData(options) as CharacterSheetData;

        // Character actor types are matrix actors.
        super._prepareMatrixAttributes(data);
        data['markedDocuments'] = this.object.getAllMarkedDocuments();

        return data;
    }
}