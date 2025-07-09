import { MatrixNetworkHackingApplication } from '../../apps/matrix/MatrixNetworkHackingApplication';
import { SR5BaseActorSheet } from "./SR5BaseActorSheet";
import { Helpers } from "../../helpers";
import { SR5Item } from '../../item/SR5Item';
import { FormDialog, FormDialogOptions } from '../../apps/dialogs/FormDialog';
import { SR5Actor } from '../SR5Actor';
import { MatrixFlow } from '../../flows/MatrixFlow';
import { ActorMarksFlow } from '../flows/ActorMarksFlow';


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
    // Stores icons connected to the selected matrix target.
    selectedMatrixTargetIcons: Shadowrun.MatrixTargetDocument[];
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

        // When target overview is shown, collect all matrix targets.
        // TODO: taMiF this is a bis of a mess and will need to be reusable across both targets and marked docs and different actor types.
        if (data.showMatrixTargets) {
            const {targets} = MatrixFlow.getMatrixTargets(this.actor);

            for (const target of targets) {
                // Collect connected icons, if user wants to see them.
                if (this._connectedIconsOpenClose[target.document.uuid]) {
                    target.icons = MatrixFlow.getConnectedMatrixIconTargets(target.document);

                    for (const icon of target.icons) {
                        // Mark icon as selected.
                        icon.selected = this.selectedMatrixTarget === icon.document.uuid;
                    }
                }
                
                // Mark target as selected.
                target.selected = this.selectedMatrixTarget === target.document.uuid;
            }

            data.matrixTargets = targets;
        }
        // When marked documents overview is shown, collect all marked documents.
        else if (data.showMatrixMarkedDocuments) {
            const markedDocuments = await this.actor.getAllMarkedDocuments();
            data.markedDocuments = this._prepareMarkedDocumentTargets(markedDocuments);
        }

        return data;
    }

    override async activateListeners(html: any) {
        super.activateListeners(html);

        html.find('.show-matrix-network-hacking').click(this._onShowMatrixNetworkHacking.bind(this));
        html.find('.reboot-persona-device').click(this._onRebootPersonaDevice.bind(this));
        html.find('.matrix-hacking-actions .item-roll').click(this._onRollMatrixAction.bind(this));

        html.find('.select-matrix-target').on('click', this._onSelectMatrixTarget.bind(this));
        html.find('.open-matrix-target').on('click', this._onOpenMarkedDocument.bind(this));

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
     * Handle user requesting to show the matrix network hacking application.
     * @param event Any pointer event
     */
    async _onShowMatrixNetworkHacking(event: Event) {
        const app = new MatrixNetworkHackingApplication(this.document);
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

        const uuid = Helpers.listItemUuid(event)
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
    async _onSelectMatrixTarget(event) {
        event.stopPropagation();

        const uuid = Helpers.listItemUuid(event);
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

    /**
     * Restructure flat list of marked documents into a hierarchical list showing personas on top level and marked
     * icons below their personas, even if those are unmarked.
     */
    _prepareMarkedDocumentTargets(markedDocuments: Shadowrun.MarkedDocument[]) {
        const targets: Shadowrun.MarkedDocument[] = [];

        // Build general hierarchy of marked documents.
        for (const target of markedDocuments) {
            // Carry over current target selection state from icons or marks list on last render.
            target.selected = this.selectedMatrixTarget === target.document.uuid;
            
            // List marked networks together with personas on top level.
            if (target.document.isNetwork) {
                targets.push(target);
                continue;
            }

            // Marked personas should be on top level.
            if (target.document.hasPersona) {
                targets.push(target);
                continue;
            }

            // Retrieve persona once to avoid multiple fromUuid calls.
            const persona = target.document.persona as SR5Actor | undefined;

            // Handle persona icons.
            if (target.document.isMatrixDevice && persona) {
                // Peresona device icons only show as personas, not as devices.
                // const personaDevice = persona.getMatrixDevice() as SR5Item;
                // if (target.document.uuid === personaDevice?.uuid) {
                //     targets.push({
                //         name: Helpers.getChatSpeakerName(persona),
                //         token: persona.getToken(),
                //         network: persona.network?.name ?? '',
                //         document: persona,
                //         icons: [],
                //         type: ActorMarksFlow.getDocumentType(persona),
                //         marks: target.marks,
                //         markId: persona.uuid,
                //         runningSilent: persona.isRunningSilent,
                //         selected: this.selectedMatrixTarget === target.document.uuid
                //     });
                //     continue;
                // }

                // Attach device icon to their persona.
                // Already in target list...
                const personaTarget = targets.find(t => t.document.uuid === persona.uuid);
                if (personaTarget) {
                    personaTarget.icons.push(target);
                // ... or to be added in.
                } else {
                    targets.push({
                        name: Helpers.getChatSpeakerName(persona),
                        token: persona.getToken(),
                        network: ActorMarksFlow.getDocumentNetwork(persona),
                        document: persona,
                        icons: [target],
                        type: ActorMarksFlow.getDocumentType(persona),
                        marks: 0,
                        markId: '',
                        // As a device is marked, the persona should be visible...
                        runningSilent: false,
                        selected: this.selectedMatrixTarget === persona.uuid
                    });
                }
            }
        }

        // Add additional sub-icons based on user wanting to see them.
        for (const target of targets) {
            if (this._connectedIconsOpenClose[target.document.uuid]) {
                const oldIcons = target.icons;
                // An already marked icon will again show up when all icons are collected.
                // So we can simply overwrite all icons here without any filtering.
                target.icons = MatrixFlow.getConnectedMatrixIconTargets(target.document)

                for (const icon of target.icons) {
                    // Mark icon as selected.
                    icon.selected = this.selectedMatrixTarget === icon.document.uuid;

                    // Transfer mark information.
                    const oldIcon = oldIcons.find(i => i.document.uuid === icon.document.uuid);
                    if (oldIcon) {
                        icon.marks = oldIcon.marks;
                        icon.markId = oldIcon.markId;
                    }
                }
            }
        }

        return targets;
    }   
}
