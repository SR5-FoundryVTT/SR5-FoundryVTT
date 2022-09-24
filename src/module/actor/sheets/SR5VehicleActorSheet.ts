import {SR5BaseActorSheet} from "./SR5BaseActorSheet";
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import {SR5Actor} from "../SR5Actor";

interface VehicleSheetDataFields {
    driver: SR5Actor|undefined
}

interface VehicleActorSheetData extends SR5ActorSheetData {
    vehicle: VehicleSheetDataFields
}


export class SR5VehicleActorSheet extends SR5BaseActorSheet {
    /**
     * Vehicle actors will handle these item types specifically.
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
        ];
    }

    /**
     * Vehicle actors will always show these item types.
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
        const data = await super.getData(options);

        // Vehicle actor type specific fields.
        data.vehicle = this._prepareVehicleFields();

        return data;
    }

    activateListeners(html: JQuery) {
        super.activateListeners(html);

        // Vehicle Sheet related handlers...
        html.find('.driver-remove').on('click', this._handleRemoveVehicleDriver.bind(this));
    }

    /**
     * Vehicle specific drop events
     * @param event A DataTransferEvent containing some form of FoundryVTT Document / Data
     */
    async _onDrop(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!event.dataTransfer) return;

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        // Handle specific system drop events.
        switch (dropData.type) {
            case "Actor":
                return await this.actor.addVehicleDriver(dropData.id)
        }

        // Handle none specific drop events.
        return super._onDrop(event);
    }

    _prepareVehicleFields(): VehicleSheetDataFields {
        const driver = this.actor.getVehicleDriver();

        return {
            driver
        };
    }

    async _handleRemoveVehicleDriver(event) {
        event.preventDefault();
        await this.actor.removeVehicleDriver();
    }
}