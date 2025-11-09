import {SR5Item} from "../../item/SR5Item";
import { MatrixActorSheetData, SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';
import { PackActionFlow } from "@/module/item/flows/PackActionFlow";
import { SheetFlow } from '@/module/flows/SheetFlow';
import HandlebarsApplicationMixin = foundry.applications.api.HandlebarsApplicationMixin;

interface ICActorSheetData extends MatrixActorSheetData {
    disableMarksEdit: boolean;
    isIC: boolean;
}

export class SR5ICActorSheet extends SR5MatrixActorSheet<ICActorSheetData> {

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
                { id: 'matrix', label: 'SR5.Tabs.Actor.IC', cssClass: '' }, // name the Matrix tab as IC since that's all it needs
                { id: 'effects', label: 'SR5.Tabs.Actor.Effects', cssClass: '' },
                { id: 'description', label: '', icon: 'far fa-info', tooltip: 'SR5.Tooltips.Actor.Description', cssClass: 'skinny' },
                { id: 'misc', label: '', icon: 'fas fa-gear', tooltip: 'SR5.Tooltips.Actor.MiscConfig', cssClass: 'skinny' },
            ]
        },
    }

    static override PARTS = {
        header: {
            template: SheetFlow.templateBase('actor/header'),
            templates: SheetFlow.templateActorSystemParts('initiative', 'common-rolls'),
        },
        tabs: {
            template: SheetFlow.templateBase('common/primary-tab-group'),
        },
        matrix: {
            template: SheetFlow.templateBase('actor/tabs/matrix'),
            templates: SheetFlow.templateActorSystemParts('active-skills', 'ic-attributes'),
            scrollable: ['#active-skills-scroll', '#matrix-actions-scroll', '#network-icons-scroll', '#marked-icons-scroll']
        },
        matrixActions: {
            template: SheetFlow.templateBase('actor/tabs/matrix/matrix-actions'),
        },
        markedIcons: {
            template: SheetFlow.templateBase('actor/tabs/matrix/marked-icons'),
            templates: SheetFlow.templateListItem('marked_icon'),
        },
        networkIcons: {
            template: SheetFlow.templateBase('actor/tabs/matrix/network-icons'),
            templates: SheetFlow.templateListItem('network_icon'),
        },
        effects: {
            template: SheetFlow.templateBase('actor/tabs/effects'),
            templates: SheetFlow.templateListItem('effect'),
            scrollable: ['.scrollable']
        },
        description: {
            template: SheetFlow.templateBase('actor/tabs/description'),
            scrollable: ['.scrollable']
        },
        misc: {
            template: SheetFlow.templateBase('actor/tabs/misc'),
            scrollable: ['.scrollable']
        },
        footer: {
            template: SheetFlow.templateBase('actor/footer'),
        },
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
                case 'blue_goo':
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

    override async _onDropItem(event: DragEvent, item: SR5Item) {
        // Handle item types that aren't handled but are still useable.
        if (item.isType('host')) {
            // We don't have to narrow down type here, the SR5Actor will handle this for us.
            return this.actor.connectNetwork(item);
        }
        await super._onDropItem(event, item);
    }
}
