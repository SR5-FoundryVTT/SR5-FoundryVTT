import {SR5BaseActorSheet} from "./SR5BaseActorSheet";
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import {SR5Item} from "../../item/SR5Item";
import MarkedDocument = Shadowrun.MarkedDocument;

interface ICActorSheetData extends SR5ActorSheetData {
    host: SR5Item|undefined
    markedDocuments: MarkedDocument[]
    disableMarksEdit: boolean
}

export class SR5ICActorSheet extends SR5BaseActorSheet {
    /**
     * IC actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getHandledItemTypes(): string[] {
        return super.getHandledItemTypes();
    }

    override async getData(options) {
        const data = await super.getData(options) as ICActorSheetData;

        // Fetch a connected host.
        data.host = this.actor.getICHost();

        // Display Matrix Marks
        data.markedDocuments = this.actor.getAllMarkedDocuments();
        data.disableMarksEdit = this.actor.hasHost();

        return data;
    }

    override activateListeners(html) {
        super.activateListeners(html);

        html.find('.entity-remove').on('click', this._removeHost.bind(this));
    }

    /**
     * Remove a connected host from the shown IC actor type.
     * @param event
     */
    async _removeHost(event) {
        event.stopPropagation();
        await this.actor.removeICHost();
    }

    override async _onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        // Nothing to be dropped...
        if (!event.dataTransfer) return;

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        // Handle IC type actor cases.
        switch(dropData.type) {
            case 'Item':
                // We don't have to narrow down type here, the SR5Actor will handle this for us.
                return await this.actor.addICHost(dropData.uuid);
        }

        // Let Foundry handle default cases.
        return super._onDrop(event);
    }
}