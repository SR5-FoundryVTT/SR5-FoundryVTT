import { Helpers } from '../../helpers';
import { MatrixActorSheetData, SR5MatrixActorSheet } from '@/module/actor/sheets/SR5MatrixActorSheet';
import { FormDialog, FormDialogOptions } from '@/module/apps/dialogs/FormDialog';


export interface CharacterSheetData extends MatrixActorSheetData {
    awakened: boolean
    emerged: boolean
    woundTolerance: number
    handledItemTypes: string[]
    inventory: Record<string, any>
}


export class SR5CharacterSheet extends SR5MatrixActorSheet {
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

    override activateListeners(html) {
        super.activateListeners(html);

        html.find('.reboot-persona-device').on('click', this._onRebootPersonaDevice.bind(this));
        html.find('.matrix-toggle-running-silent').on('click', this._onMatrixToggleRunningSilent.bind(this));
    }

    private async _onMatrixToggleRunningSilent(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!this.actor.isMatrixActor) return;

        const device = this.actor.matrixData()?.device;
        if (!device) return;


        const item = this.actor.items.get(device);
        if (!item) return;

        // iterate through the states of online -> silent -> offline
        const newState = item.isRunningSilent() ? 'online' : 'silent';

        // update the embedded item with the new wireless state
        await this.actor.updateEmbeddedDocuments('Item', [{
            '_id': device,
            system: { technology: { wireless: newState } }
        }]);
    }

    /**
     * Handle the user request to reboot their main active matrix device or living persona.
     * @param event Any pointer event
     */
    async _onRebootPersonaDevice(event: Event) {
        const data = {
            title: game.i18n.localize("SR5.RebootConfirmationDialog.Title"),
            buttons: {
                confirm: {
                    label: game.i18n.localize('SR5.RebootConfirmationDialog.Confirm')
                },
                cancel: {
                    label: game.i18n.localize('SR5.RebootConfirmationDialog.Cancel')
                }
            },
            content: '',
            default: 'cancel',
            templateData: {},
            templatePath: 'systems/shadowrun5e/dist/templates/apps/dialogs/reboot-confirmation-dialog.hbs'
        }
        const options = {
            classes: ['sr5', 'form-dialog'],
        } as FormDialogOptions;
        const dialog = new FormDialog(data, options);
        await dialog.select();
        if (dialog.canceled || dialog.selectedButton !== 'confirm') return;

        await this.actor.rebootPersona();
    }


    override async getData(options) {
        const data = await super.getData(options) as CharacterSheetData;

        // Character actor types are matrix actors.
        super._prepareMatrixAttributes(data);
        return data;
    }

    /**
     * Inject special case handling for call in action items, only usable by character actors.
     */
    override async _onItemCreate(event) {
        event.preventDefault();
        const type = event.currentTarget.closest('.list-header').dataset.itemId;

        if (type !== 'summoning' && type !== 'compilation')
            return super._onItemCreate(event);

        return this._onCallInActionCreate(type);
    }

    /**
     * Create a call in action item with pre configured actor type.
     *
     * @param type The call in action sub type.
     */
    async _onCallInActionCreate(type: 'summoning'|  'compilation') {
        // Determine actor type from sub item type.
        const typeToActorType = {
            'summoning': 'spirit',
            'compilation': 'sprite'
        } as const;
        const actor_type = typeToActorType[type];
        if (!actor_type) return console.error('Shadowrun 5e | Call In Action Unknown actor type during creation');

        // TODO: Add translation for item names...
        const itemData: Item.CreateData = {
            name: `${game.i18n.localize('SR5.New')} ${Helpers.label(type)}`,
            type: 'call_in_action',
            system: { actor_type }
        };

        await this.actor.createEmbeddedDocuments('Item', [itemData], { renderSheet: true });
    }

}
