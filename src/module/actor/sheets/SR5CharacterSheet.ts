import { MatrixTargetAcquisitionApplication } from './../../apps/matrix/MatrixTargetAquisition';
import { SR5BaseActorSheet } from "./SR5BaseActorSheet";
import { Helpers } from "../../helpers";
import { SR5Item } from '../../item/SR5Item';


export interface CharacterSheetData extends Shadowrun.SR5ActorSheetData {
    awakened: boolean
    emerged: boolean
    woundTolerance: number
    markedDocuments: Shadowrun.MarkedDocument[]
    handledItemTypes: string[]
    inventory: Record<string, any>
    network: SR5Item | undefined
    matrixActions: SR5Item[]
}


export class SR5CharacterSheet extends SR5BaseActorSheet {
    /**
     * Character actors will handle these item types specifically.
     *
     * All others will be collected within the gear tab.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getHandledItemTypes(): string[] {
        const itemTypes = super.getHandledItemTypes();

        return [
            ...itemTypes,
            'program',
            'sin',
            'lifestyle',
            'contact',
            'spell',
            'ritual_spells',
            'adept_power',
            'complex_form',
            'quality',
            'echo',
            'metamagic',
            'critter_power',
            'call_in_action',
            'ritual'
        ];
    }

    /**
     * Character actors will always show these item types.
     *
     * For more info see into super.getInventoryItemTypes jsdoc.
     *
     * @returns An array of item types from the template.json Item section.
     */
    override getInventoryItemTypes(): string[] {
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

    override async getData(options) {
        const data = await super.getData(options) as CharacterSheetData;

        // Character actor types are matrix actors.
        super._prepareMatrixAttributes(data);

        data.markedDocuments = await this.actor.getAllMarkedDocuments();
        data.network = this.actor.network;
        data.matrixActions = await this.getMatrixActions();

        return data;
    }

    override async activateListeners(html: any) {
        super.activateListeners(html);

        html.find('.show-matrix-target-acquisition').click(this._onShowMatrixTargetAcquisition.bind(this));
        html.find('.reboot-persona-device').click(this._onRebootPersonaDevice.bind(this));
        html.find('.matrix-hacking-actions .item-roll').click(this._onRollMatrixAction.bind(this));
    }

    /**
     * Inject special case handling for call in action items, only usable by character actors.
     */
    override async _onItemCreate(event) {
        event.preventDefault();
        const type = event.currentTarget.closest('.list-header').dataset.itemId;

        if (type !== 'summoning' && type !== 'compilation') return await super._onItemCreate(event);
        await this._onCallInActionCreate(type);
    }

    /**
     * Create a call in action item with pre configured actor type.
     *
     * @param type The call in action sub type.
     */
    async _onCallInActionCreate(type: 'summoning' | 'compilation') {
        // Determine actor type from sub item type.
        const typeToActorType = {
            'summoning': 'spirit',
            'compilation': 'sprite'
        }
        const actor_type = typeToActorType[type];
        if (!actor_type) return console.error('Shadowrun 5e | Call In Action Unknown actor type during creation');

        // TODO: Add translation for item names...
        const itemData = {
            name: `${game.i18n.localize('SR5.New')} ${Helpers.label(type)}`,
            type: 'call_in_action',
            'system.actor_type': actor_type
        };

        await this.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
    }

    /**
     * Handle the user request to show the matrix target acquisition application.
     * @param event Any pointer event
     */
    async _onShowMatrixTargetAcquisition(event: Event) {
        const app = new MatrixTargetAcquisitionApplication(this.document);
        app.render(true);
    }

    /**
     * Handle the user request to reboot their main active matrix device or living persona.
     * @param event Any pointer event
     */
    async _onRebootPersonaDevice(event: Event) {
        await this.actor.rebootPersona();
    }

    /**
     * Retrieve all matrix actions from the corresponding pack to be displayed.
     * 
     * @returns Alphabetically sorted array of matrix actions.
     */
    async getMatrixActions() {
        const actions = await Helpers.getPackActions('matrix-actions');
        return actions.sort(Helpers.sortByName.bind(Helpers));
    }

    /**
     * Cast a matrix action for this actor. Use the actions from the matrix pack for this.
     */
    async _onRollMatrixAction(event) {
        event.preventDefault();

        const id = Helpers.listItemId(event);
        const action = await fromUuid(id) as SR5Item;
        if (!action) return;

        const options = { event };
        this.actor.rollMatrixAction(action.name as string, options);
    }
}