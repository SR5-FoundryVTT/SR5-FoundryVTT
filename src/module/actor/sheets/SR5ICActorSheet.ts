import {SR5Item} from "../../item/SR5Item";
import { MatrixActorSheetData, SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';
import { PackActionFlow } from "@/module/item/flows/PackActionFlow";

interface ICActorSheetData extends MatrixActorSheetData {
    disableMarksEdit: boolean;
    isIC: boolean;
}

export class SR5ICActorSheet extends SR5MatrixActorSheet<ICActorSheetData> {
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

    override async _prepareContext(options) {
        const data = await super._prepareContext(options);
        data.disableMarksEdit = this.actor.hasHost();
        data.isIC = true;

        return data;
    }

    static override TABS = {
        ...super.TABS,
        primary: {
            initial: 'matrix',
            tabs: [
                { id: 'actions', label: 'Actions', cssClass: '' },
                { id: 'matrix', label: 'Matrix', cssClass: '' },
                { id: 'effects', label: 'Effects', cssClass: '' },
                { id: 'misc', label: 'Misc', cssClass: '' },
            ]
        },
        matrixLeft: {
            initial: 'networkIcons',
            tabs: [
                { id: 'networkIcons', label: 'Icons', cssClass: ''},
                { id: 'markedIcons', label: 'Marked', cssClass: ''},

            ]
        },
    }

    static override PARTS: any = {
        header: {
            template: this.templateBase('actor/header'),
            templates: this.actorSystemParts(
                'movement', 'vehicle-movement',
                'initiative',
                'common-rolls', 'vehicle-rolls'
            )
        },
        tabs: {
            template: this.templateBase('actor/primary-tab-navigation'),
        },
        actions: {
            template: this.templateBase('actor/tabs/actions'),
        },
        matrix: {
            template: this.templateBase('actor/tabs/ic-matrix'),
            templates: this.actorSystemParts('active-skills', 'ic-attributes', 'ic-options')
        },
        matrixActions: {
            template: this.templateBase('actor/tabs/matrix/matrix-actions'),
        },
        markedIcons: {
            template: this.templateBase('actor/tabs/matrix/marked-icons'),
        },
        networkIcons: {
            template: this.templateBase('actor/tabs/matrix/network-icons'),
        },
        effects: {
            template: this.templateBase('actor/tabs/effects'),
        },
        misc: {
            template: this.templateBase('actor/tabs/ic-misc'),
        },
        footer: {
            template: this.templateBase('actor/footer'),
        },
    }

    override activateListeners_LEGACY(html) {
        super.activateListeners_LEGACY(html);

        html.find('.entity-remove').on('click', this._removeHost.bind(this));
    }

    /**
     * Retrieve all matrix actions from the corresponding pack to be displayed.
     *
     * If a marked document is selected, only actions with a mark requirement will show.
     *
     * @returns Alphabetically sorted array of matrix actions.
     */
    protected override async _getMatrixPackActions() {
        const matrixPackName = PackActionFlow.getICActionsPackName();

        // get the IC pack actions and filter by our type
        return (await PackActionFlow.getPackActions(matrixPackName)).filter((action) => {
            switch (this.actor.icType()) {
                case 'acid':
                    return action.name === "Acid";
                case 'binder':
                    return action.name === "Binder";
                case 'bloodhound':
                    return action.name === "Track" || action.name === 'Patrol';
                case 'blue_gloo':
                    return action.name === 'Blue Goo';
                case 'black_ic':
                    return action.name === "Black";
                case 'blaster':
                    return action.name === "Blaster";
                case 'catapult':
                    return action.name === "Catapult";
                case 'crash':
                    return action.name === "Crash";
                case 'flicker':
                    return action.name === "Flicker";
                case 'jammer':
                    return action.name === "Jammer";
                case 'killer':
                    return action.name === "Killer";
                case 'marker':
                    return action.name === "Marker";
                case 'patrol':
                    return action.name === "Patrol";
                case 'probe':
                    return action.name === "Probe";
                case 'scramble':
                    return action.name === "Scramble";
                case 'shocker':
                    return action.name === "Shocker";
                case 'sleuther':
                    return action.name === "Sleuther";
                case 'sparky':
                    return action.name === "Sparky";
                case 'tar_baby':
                    return action.name === "Tar Baby";
                case 'track':
                    return action.name === "Track";
                default:
                    console.warn('Shadowrun5e | Could not process IC Type', this.actor.icType())
                    return false
            }
        });
    }

    /**
     * Remove a connected host from the shown IC actor type.
     * @param event
     */
    async _removeHost(event) {
        event.stopPropagation();
        await this.actor.disconnectNetwork();
    }

    override async _onDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();

        // Nothing to be dropped...
        if (!event.dataTransfer) return;

        const dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

        // Some item types need special handling for IC Actors.
        switch(dropData.type) {
            case 'Item':
                const item = await fromUuid(dropData.uuid) as SR5Item;
                
                // Handle item types that aren't handled but are still useable.
                switch (item.type) {
                    case 'host':
                        // We don't have to narrow down type here, the SR5Actor will handle this for us.
                        return this.actor.connectNetwork(item);
                    }
                
                // Avoid adding item types to the actor, that aren't handled on the sheet anywhere.
                const handledTypes = [...this.getHandledItemTypes(), ...this.getInventoryItemTypes()];
                if (!handledTypes.includes(item.type)) return;
        }        

        // Default cases can be handled by the base class and Foundry.
        return super._onDrop(event);
    }
}
