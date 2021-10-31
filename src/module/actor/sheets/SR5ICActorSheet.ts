import {SR5BaseActorSheet} from "./SR5BaseActorSheet";

export class SR5ICActorSheet extends SR5BaseActorSheet {
    getData(): any {
        const data = super.getData();

        // Fetch a connected host.
        const icData = this.object.asICData();
        data.host = game.items?.get(icData?.data.host.id as string);

        // Display Matrix Marks
        data['markedDocuments'] = this.object.getAllMarkedDocuments();
        data['disableMarksEdit'] = this.object.hasHost();

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.entity-remove').on('click', this._removeHost.bind(this));
    }

    /**
     * Remove a connected host from the shown IC actor type.
     * @param event
     */
    async _removeHost(event) {
        event.stopPropagation();
        await this.object.removeICHost();
    }

    _onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        // Nothing to be dropped...
        if (!event.dataTransfer) return;

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        // Handle IC type actor cases.
        switch(dropData.type) {
            case 'Item':
                // We don't have to narrow down type here, the SR5Actor will handle this for us.
                this.object.addICHost(dropData.id);
                break;
        }

        // Let Foundry handle default cases.
        return super._onDrop(event);
    }
}