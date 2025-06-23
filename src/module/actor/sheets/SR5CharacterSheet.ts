import { MatrixTargetAcquisitionApplication } from './../../apps/matrix/MatrixTargetAquisition';
import { SR5BaseActorSheet } from "./SR5BaseActorSheet";
import { Helpers } from "../../helpers";
import { SR5Item } from '../../item/SR5Item';
import { FormDialog, FormDialogOptions } from '../../apps/dialogs/FormDialog';
import { SR5Actor } from '../SR5Actor';
import { MatrixFlow } from '../../flows/MatrixFlow';


export interface CharacterSheetData extends Shadowrun.SR5ActorSheetData {
    awakened: boolean
    emerged: boolean
    woundTolerance: number
    markedDocuments: Shadowrun.MarkedDocument[]
    handledItemTypes: string[]
    inventory: Record<string, any>
    network: SR5Item | null
    matrixActions: SR5Item[]
    selectedMatrixTarget: string|undefined
    // Determine if the hacking tab should show marked documents or new targets.
    showMatrixMarkedDocuments: boolean
    showMatrixTargets: boolean
    // Targets to be displayed in the matrix tab.
    matrixTargets: Shadowrun.MatrixTargetDocument[]
}


export class SR5CharacterSheet extends SR5BaseActorSheet {
    // Stores which document has been selected for a Decker in the matrix tab.
    // We accept this selection to not be persistant across Foundry sessions.
    selectedMatrixTarget: string|undefined;
    // Stores if the hacking tab should show marked documents or new targets.
    showMatrixHackingTarget: 'marked'|'targets' = 'marked';

    static override get defaultOptions() {
        const defaultOptions = super.defaultOptions;
        return foundry.utils.mergeObject(defaultOptions, {
            tabs: [...defaultOptions.tabs,
            {
                navSelector: '.tabs[data-group="matrix"]',
                contentSelector: '.tabsbody[data-group="matrix"]',
                initial: 'actions',
            }]
        });
    }
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

        data.network = this.actor.network;
        data.matrixActions = await this.getMatrixActions();

        data.selectedMatrixTarget = this.selectedMatrixTarget;
        data.showMatrixMarkedDocuments = this.showMatrixHackingTarget === 'marked';
        data.showMatrixTargets = this.showMatrixHackingTarget === 'targets';

        if (data.showMatrixTargets) {
            const {targets} = MatrixFlow.getMatrixTargets(this.actor);
            data.matrixTargets = targets;
        }
        else if (data.showMatrixMarkedDocuments) {
            data.markedDocuments = await this.actor.getAllMarkedDocuments();
        }

        return data;
    }

    override async activateListeners(html: any) {
        super.activateListeners(html);

        html.find('.show-matrix-target-acquisition').click(this._onShowMatrixTargetAcquisition.bind(this));
        html.find('.reboot-persona-device').click(this._onRebootPersonaDevice.bind(this));
        html.find('.matrix-hacking-actions .item-roll').click(this._onRollMatrixAction.bind(this));

        html.find('.select-document').on('click', this._onSelectMarkedDocument.bind(this));
        html.find('.open-document').on('click', this._onOpenMarkedDocument.bind(this));

        html.find('.switch-matrix-hacking-target').on('click', this._onSwitchMatrixHackingTarget.bind(this));
        html.find('.targets-refresh').on('click', this._onTargetsRefresh.bind(this));
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
            templatePath: 'systems/shadowrun5e/dist/templates/apps/dialogs/reboot-confirmation-dialog.html'
        }
        const options = {
            classes: ['sr5', 'form-dialog'],
        } as FormDialogOptions;
        const dialog = new FormDialog(data, options);
        await dialog.select();
        if (dialog.canceled || dialog.selectedButton !== 'confirm') return;

        await this.actor.rebootPersona();
    }

    /**
     * Retrieve all matrix actions from the corresponding pack to be displayed.
     *
     * If a marked document is selected, only actions with a mark requirement will show.
     *
     * @returns Alphabetically sorted array of matrix actions.
     */
    async getMatrixActions() {
        const matrixPackName = Helpers.getMatrixActionsPackName();

        // Collect all sources for matrix actions.
        const packActions = await Helpers.getPackActions(matrixPackName);
        const actorActions = MatrixFlow.getMatrixActions(this.actor);
        // Assume above collections return action only.
        let actions = [...packActions, ...actorActions] as Shadowrun.ActionItemData[];

        // Reduce actions to those matching the marks on the selected target.
        if (this.selectedMatrixTarget) {
            const marks = this.actor.getMarksPlaced(this.selectedMatrixTarget);
            actions = actions.filter(action => (action.system.action.category.matrix?.marks ?? 0) <= marks);
        }

        return actions.sort(Helpers.sortByName.bind(Helpers)) as SR5Item[];
    }

    /**
     * Cast a matrix action for this actor. Use the actions from the matrix pack for this.
     */
    async _onRollMatrixAction(event) {
        event.preventDefault();

        const id = Helpers.listItemId(event);
        const action = await fromUuid(id) as SR5Item;
        if (!action) return;

        // this.actor.rollItem(action, {event});

        const test = await this.actor.testFromItem(action, {event});
        if (!test) return;

        if (this.selectedMatrixTarget) {
            const document = fromUuidSync(this.selectedMatrixTarget) as Shadowrun.NetworkDevice;
            if (!document) return;

            await test.addTarget(document);
        }

        await test.execute();
    }

    /**
     * Open a document from a DOM node containing a dataset uuid.
     *
     * This is intended to let deckers open marked documents they're FoundryVTT user has permissions for.
     *
     * @param event Any interaction event
     */
    async _onOpenMarkedDocument(event) {
        event.stopPropagation();

        const uuid = event.currentTarget.dataset.uuid;
        if (!uuid) return;

        // Marked documents can´t live in packs.
        const document = fromUuidSync(uuid) as SR5Item|SR5Actor;
        if (!document) return;

        document.sheet?.render(true);
    }

    /**
     * Select a marked document on the deckers marks list.
     *
     * This is intended to filter the available list of matrix actions and to
     * use the selected marked document as the target for rolling on that.
     *
     * @param event Any interaction event
     */
    async _onSelectMarkedDocument(event) {
        event.stopPropagation();

        const uuid = event.currentTarget.dataset.uuid;
        if (!uuid) return;

        // Toggle selection on or off.
        if (this.selectedMatrixTarget === uuid) {
            this.selectedMatrixTarget = undefined;
        } else {
            this.selectedMatrixTarget = uuid;
        }

        this.render();
    }

    /**
     * Switch between different display modes on the matrix hacking tab for what target type display to
     * users.
     */
    async _onSwitchMatrixHackingTarget(event) {
        event.stopPropagation();

        this.showMatrixHackingTarget = this.showMatrixHackingTarget === 'marked' ? 'targets' : 'marked';
        this.render();
    }

    /**
     * Manual user interaction to refresh list of show matrix targets.
     */
    async _onTargetsRefresh(event) {
        event.stopPropagation();

        this.render();
    }
}
