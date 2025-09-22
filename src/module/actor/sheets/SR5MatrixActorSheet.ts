import { MatrixNetworkHackingApplication } from '../../apps/matrix/MatrixNetworkHackingApplication';
import { SR5BaseActorSheet } from "./SR5BaseActorSheet";
import { Helpers } from "../../helpers";
import { SR5Item } from '../../item/SR5Item';
import { SR5Actor } from '../SR5Actor';
import { ActorMarksFlow } from '../flows/ActorMarksFlow';
import { MatrixTargetingFlow } from '@/module/flows/MatrixTargetingFlow';
import { MatrixNetworkFlow } from '@/module/item/flows/MatrixNetworkFlow';
import { PackActionFlow } from '@/module/item/flows/PackActionFlow';
import { MatrixSheetFlow } from '@/module/flows/MatrixSheetFlow';

import MatrixTargetDocument = Shadowrun.MatrixTargetDocument;
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import { SheetFlow } from '@/module/flows/SheetFlow';


export interface MatrixActorSheetData extends SR5ActorSheetData {
    markedDocuments: Shadowrun.MarkedDocument[]
    handledItemTypes: string[]
    network: SR5Item | null
    matrixActions: {name: string, action: SR5Item}[]
    selectedMatrixTarget: string|undefined
    // Stores icons connected to the selected matrix target.
    selectedMatrixTargetIcons: Shadowrun.MatrixTargetDocument[];
    // Targets to be displayed in the matrix tab.
    matrixTargets: Shadowrun.MatrixTargetDocument[];
    // the master device being used to connect to the matrix
    matrixDevice: SR5Item | undefined;
    // Matrix ICONs that are owned by this actor
    ownedIcons: MatrixTargetDocument[];
}

export class SR5MatrixActorSheet<T extends MatrixActorSheetData = MatrixActorSheetData> extends SR5BaseActorSheet<T> {
    // Stores which document has been selected in the matrix tab.
    // We accept this selection to not be persistant across Foundry sessions.
    selectedMatrixTarget: string|undefined;
    _connectedIconsOpenClose: Record<string, boolean> = {};

    override async _prepareContext(options) {
        const data = await super._prepareContext(options);

        data.network = this.actor.network;
        data.matrixLeftTabs = this._prepareTabs('matrixLeft');
        data.matrixRightTabs = this._prepareTabs('matrixRight');
        this._prepareMatrixDevice(data);

        return data;
    }

    static override DEFAULT_OPTIONS: any = {
        actions: {
            toggleConnectedMatrixIcons: SR5MatrixActorSheet.#toggleConnectedMatrixIcons,
            openMatrixDocument: SR5MatrixActorSheet.#openMatrixDocument,
            selectMatrixTarget: SR5MatrixActorSheet.#selectMatrixTarget,
            connectToNetwork: SR5MatrixActorSheet.#connectToMatrixNetwork,
            rebootPersona: SR5MatrixActorSheet.#rebootPersonaDevice,
            showMatrixNetworkSelection: SR5MatrixActorSheet.#showMatrixNetworkSelection,
            connectToMarkedNetwork: SR5MatrixActorSheet.#connectToMarkedNetwork,
            disconnectNetwork: SR5MatrixActorSheet.#disconnectNetwork,
            togglePersonaRunningSilent: SR5MatrixActorSheet.#togglePersonaRunningSilent,
            addOneMark: SR5MatrixActorSheet.#addOneMark,
            removeOneMark: SR5MatrixActorSheet.#removeOneMark,
            setupPAN: SR5MatrixActorSheet.#addAllEquippedWirelessDevicesToPAN,
            refreshTargets: SR5MatrixActorSheet.#refreshTargets,
            removeMarks: SR5MatrixActorSheet.#deleteMarks,
            clearAllMarks: SR5MatrixActorSheet.#clearAllMarks,
        }

    }

    static override TABS = {
        ...super.TABS,
        matrixLeft: {
            initial: 'networkIcons',
            tabs: [
                { id: 'programs', label: 'Programs', cssClass: ''},
                { id: 'networkIcons', label: 'Icons', cssClass: ''},
                { id: 'markedIcons', label: 'Marked', cssClass: ''},
                { id: 'ownedIcons', label: 'Owned', cssClass: ''},

            ]
        },
        matrixRight: {
            initial: 'matrixActions',
            tabs: [
                { id: 'matrixActions', label: 'Actions', cssClass: '', }
            ]
        }
    }

    /**
     * Move tabs into a target and delete
     * @param tabs
     * @param parts
     * @param target
     * @protected
     */
    protected moveTabs(tabs: any, parts: any, target: any) {
        for (const tab of tabs) {
            const key = tab.id;
            if (key in parts) {
                target.append(parts[key]);
                delete parts[key];
            }
        }
    }

    protected override async _renderHTML(content, options) {
        const parts = await super._renderHTML(content, options);
        const matrixLeftSideContent = parts.matrix.querySelector("section.content.matrix-left-tab-content");
        if (matrixLeftSideContent) {
            this.moveTabs(SR5MatrixActorSheet.TABS.matrixLeft.tabs, parts, matrixLeftSideContent);
        }
        const matrixRightSideContent = parts.matrix.querySelector("section.content.matrix-right-tab-content");
        if (matrixRightSideContent) {
            this.moveTabs(SR5MatrixActorSheet.TABS.matrixRight.tabs, parts, matrixRightSideContent);
        }

        return parts;
    }

    static override PARTS = {
        ...super.PARTS,
        matrix: {
            template: SheetFlow.templateBase('actor/tabs/matrix'),
            scrollable: ['scrollable']
        },
        matrixActions: {
            template: SheetFlow.templateBase('actor/tabs/matrix/matrix-actions'),
            templates: SheetFlow.listItem('action'),
            scrollable: ['scrollable']
        },
        markedIcons: {
            template: SheetFlow.templateBase('actor/tabs/matrix/marked-icons'),
            templates: SheetFlow.listItem('marked_icon'),
            scrollable: ['scrollable']
        },
        ownedIcons: {
            template: SheetFlow.templateBase('actor/tabs/matrix/owned-icons'),
            templates: SheetFlow.listItem('owned_icon'),
            scrollable: ['scrollable']
        },
        networkIcons: {
            template: SheetFlow.templateBase('actor/tabs/matrix/network-icons'),
            templates: SheetFlow.listItem('network_icon'),
            scrollable: ['scrollable']
        },
        programs: {
            template: SheetFlow.templateBase('actor/tabs/matrix/programs'),
            templates: SheetFlow.listItem('program'),
            scrollable: ['scrollable']
        }
    }

    override async _preparePartContext(partId, context, options) {
        const partContext = await super._preparePartContext(partId, context, options) as any;

        if (partId === 'matrixActions') {
            partContext.matrixActions = await this._prepareMatrixActions();
        } else if (partId === 'ownedIcons') {
            this._prepareOwnedIcons(partContext);
        } else if (partId === 'networkIcons') {
            this._prepareMatrixTargets(partContext);
        } else if (partId === 'markedIcons') {
            await this._prepareMarkedDocuments(partContext);
        }

        if (partContext?.matrixLeftTabs) {
            if (partId in partContext.matrixLeftTabs) {
                partContext.tab = partContext.matrixLeftTabs[partId];
            }
        }
        if (partContext?.matrixRightTabs) {
            if (partId in partContext.matrixRightTabs) {
                partContext.tab = partContext.matrixRightTabs[partId];
            }
        }

        return partContext;
    }

    /**
     * Add the currently equipped matrix device to the sheet data
     * @param data
     */
    _prepareMatrixDevice(data: MatrixActorSheetData) {
        data.matrixDevice = this.actor?.getMatrixDevice();
    }

    _prepareOwnedIcons(data: MatrixActorSheetData) {
        // When target overview is shown, collect all matrix targets.
        const targets = MatrixTargetingFlow.prepareOwnIcons(this.actor);

        this._prepareSelectedMatrixTargets(targets);

        data.ownedIcons = targets;
    }

    _prepareMatrixTargets(data: MatrixActorSheetData) {
        data.selectedMatrixTarget = this.selectedMatrixTarget;

        // When target overview is shown, collect all matrix targets.
        const {targets} = MatrixTargetingFlow.getTargets(this.actor);

        this._prepareSelectedMatrixTargets(targets);

        data.matrixTargets = targets;
    }

    _prepareSelectedMatrixTargets(targets: MatrixTargetDocument[]) {
        for (const target of targets) {
            // Collect connected icons, if user wants to see them.
            if (this._connectedIconsOpenClose[target.document.uuid]) {
                target.icons = MatrixTargetingFlow.getConnectedMatrixIconTargets(target.document as SR5Actor);

                for (const icon of target.icons) {
                    // Mark icon as selected.
                    icon.selected = this.selectedMatrixTarget === icon.document.uuid;
                }
            }

            // Mark target as selected.
            target.selected = this.selectedMatrixTarget === target.document.uuid;
        }
    }

    async _prepareMarkedDocuments(data: MatrixActorSheetData) {
        // When marked documents overview is shown, collect all marked documents.
        const markedDocuments = await this.actor.getAllMarkedDocuments();
        data.markedDocuments = this._prepareMarkedDocumentTargets(markedDocuments);
    }

    /**
     * Handle changing if an Actor is Running Silent
     * @param event
     * @private
     */
    static  async #togglePersonaRunningSilent(this: SR5MatrixActorSheet, event) {
        event.preventDefault();
        event.stopPropagation();
        await MatrixSheetFlow.toggleRunningSilent(this.actor);
    }

    /**
     * Handle the user request to reboot their main active matrix device or living persona.
     * @param event Any pointer event
     */
    static async #rebootPersonaDevice(this: SR5MatrixActorSheet, event: Event) {
        event.preventDefault();
        event.stopPropagation();
        await MatrixSheetFlow.promptRebootPersonaDevice(this.actor);
    }

    /**
     * Allow the user to select a matrix network to connect to.
     */
    static async #connectToMatrixNetwork(this: SR5MatrixActorSheet, event) {
        event.preventDefault();
        event.stopPropagation();

        if (await MatrixSheetFlow.promptConnectToMatrixNetwork(this.actor)) {
            this.render();
        }
    }

    /**
     * Within the list of avialable matrix targets, toggle visibility of sub-sections for connected icons
     * for a single matrix target.
     *
     * This is done by clicking on a specific icon by user input and will trigger:
     * - switching out sheet display
     * - provide a display of additional matrix icons underneath uuid
     */
    static async #toggleConnectedMatrixIcons(this: SR5MatrixActorSheet, event) {
        event.stopPropagation();
        console.log('Toggle connected matrix icons', event);

        const uuid = event.target.dataset.itemId;
        if (!uuid) return;

        // Mark main icon as open or closed.
        if (this._connectedIconsOpenClose[uuid]) delete this._connectedIconsOpenClose[uuid];
        else this._connectedIconsOpenClose[uuid] = true;

        // Trigger new icons to be shown or hidden.
        this.render();
    }

    /**
     * Add All equipped wireless items on the character to their PAN
     * @param event
     */
    static async #addAllEquippedWirelessDevicesToPAN(this: SR5MatrixActorSheet, event) {
        event.stopPropagation();
        const matrixDevice = this.actor.getMatrixDevice();
        if (matrixDevice) {
            console.debug('Shadowrun5e | Adding all equipped wireless devices to actor PAN ->', event);
            const progressBar = ui.notifications.info(game.i18n.localize("SR5.Notifications.AddDevicesToPAN.Starting"), { progress: true });
            const allItems = this.actor.items;
            const filteredItems: SR5Item[] = [];
            for (const item of allItems) {
                if (item.isMatrixDevice && item.isWireless() && item.isEquipped() && item.id !== matrixDevice.id) {
                    filteredItems.push(item);
                }
            }
            let i = 0;
            const total = filteredItems.length;
            for (const item of filteredItems) {
                i++;
                await matrixDevice.addSlave(item, { triggerUpdate: false });
                progressBar.update({
                    pct: i / total,
                    message: `(${i}/${total}) ${game.i18n.localize(`SR5.Notifications.AddDevicesToPAN.Adding`)} ${item.name} `
                });
            }
            await MatrixNetworkFlow._triggerUpdateForNetworkConnectionChange(matrixDevice, null);
            progressBar.remove();
            ui.notifications.info(game.i18n.localize(`SR5.Notifications.AddDevicesToPAN.FinishedAddingItems`));
        }
    }

    /**
     * Handle user requesting to show the matrix network hacking application.
     * @param event Any pointer event
     */
    static async #showMatrixNetworkSelection(this: SR5MatrixActorSheet, event) {
        const app = new MatrixNetworkHackingApplication(this.document);
        app.render(true);
    }

    /**
     * Get Matrix actions from the set compendia pack that the character should see
     * @protected
     */
    protected async _getMatrixPackActions() {
        const matrixPackName = PackActionFlow.getMatrixActionsPackName();
        // Collect all sources for matrix actions.
        return await PackActionFlow.getPackActions(matrixPackName);
    }


    /**
     * Retrieve all matrix actions from the corresponding pack to be displayed.
     *
     * If a marked document is selected, only actions with a mark requirement will show.
     *
     * @returns Sorted list of objects containg a localized name and action item for sheet display.
     */
    async _prepareMatrixActions() {
        let actions = await PackActionFlow.getActorMatrixActions(this.actor);
        // Reduce actions to those matching the marks on the selected target.
        if (this.selectedMatrixTarget) {
            const ownedItem = this.actor.isOwnerOf(this.selectedMatrixTarget);
            const marksPlaced = this.actor.getMarksPlaced(this.selectedMatrixTarget);
            actions = actions.filter(action => {
                const {marks, owner} = action.system.action.category.matrix
                if (owner) return ownedItem;
                // you can do actions that require marks on your own devices
                return ownedItem || marks <= marksPlaced;
            });
        }

        // Prepare sorting and display of a possibly translated document name.
        return actions.map(action => {
                return {
                    name: PackActionFlow.localizePackAction(action.name),
                    action
                };
            })
            .sort(Helpers.sortByName.bind(Helpers));
    }

    /**
     * Override rolling items to include a check for matrix actions
     * @param item
     * @param event
     */
    override async _handleRollItem(item: SR5Item, event): Promise<void> {
        if (this.selectedMatrixTarget && item.hasActionCategory('matrix')) {
            const document = fromUuidSync(this.selectedMatrixTarget) as SR5Actor | SR5Item;
            if (!document) return;
            const test = await this.actor.testFromItem(item, {event});
            if (test) {
                await test.addTarget(document);
                await test.execute();
            }
        } else {
            await super._handleRollItem(item, event);
        }
    }

    /**
     * Open a document from a DOM node containing a dataset uuid.
     *
     * This is intended to let deckers open marked documents they're FoundryVTT user has permissions for.
     *
     * @param event Any interaction event
     */
    static async #openMatrixDocument(this: SR5MatrixActorSheet, event) {
        event.stopPropagation();

        const uuid = $(event.target).closest('a').data().itemId;
        if (!uuid) return;

        // Marked documents can´t live in packs.
        const document = fromUuidSync(uuid) as SR5Item|SR5Actor;
        if (!document) return;

        await document.sheet?.render(true);
    }

    /**
     * Select a marked document on the deckers marks list.
     *
     * This is intended to filter the available list of matrix actions and to
     * use the selected marked document as the target for rolling on that.
     *
     * @param event Any interaction event
     */
    static async #selectMatrixTarget(this: SR5MatrixActorSheet, event) {
        event.stopPropagation();

        const uuid = $(event.target).closest('a').data().itemId;
        if (!uuid) return;

        if (this.selectedMatrixTarget === uuid) {
            this.selectedMatrixTarget = undefined;
        } else {
            this.selectedMatrixTarget = uuid;
        }

        this.informAboutOfflineSelection();

        this.render();
    }

    /**
     * Manual user interaction to refresh list of show matrix targets.
     */
    static async #refreshTargets(this: SR5MatrixActorSheet, event) {
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
            if (target.document instanceof SR5Item && target.document.isNetwork()) {
                targets.push(target);
                continue;
            }

            // Marked personas should be on top level.
            if (target.document instanceof SR5Actor && target.document.hasPersona) {
                targets.push(target);
                continue;
            }

            // Retrieve persona once to avoid multiple fromUuid calls.
            const persona = target.document instanceof SR5Item ? target.document.persona : undefined;

            // Handle persona icons.
            if (target.document instanceof SR5Item && target.document.isMatrixDevice && persona) {
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
                        type: MatrixNetworkFlow.getDocumentType(persona),
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

                target.icons = MatrixTargetingFlow.getConnectedMatrixIconTargets(target.document as SR5Actor);

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

    /**
     * Offline targets can be selected however later matrix actions may not be possible.
     *
     * Let users know about the limitations of selecting offline targets.
     */
    informAboutOfflineSelection() {
        if (!this.selectedMatrixTarget) return;

        const target = foundry.utils.fromUuidSync(this.selectedMatrixTarget);
        if (!(target instanceof SR5Actor) || target?.hasPersona) return;

        ui.notifications.error('SR5.Errors.MarksCantBePlacedWithoutPersona', {localize: true});
    }

    static async #addOneMark(this: SR5MatrixActorSheet, event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.actor.hasHost()) {
            ui.notifications?.info(game.i18n.localize('SR5.Infos.CantModifyHostContent'));
            return;
        }

        const uuid = $(event.target).closest('a').data().itemId;
        if (!uuid) return;

        const markedDocument = await ActorMarksFlow.getMarkedDocument(uuid);
        if (!markedDocument) return;

        await this.actor.setMarks(markedDocument, 1);
    }

    static async #removeOneMark(this: SR5MatrixActorSheet, event) {
        event.preventDefault();
        event.stopPropagation();
        if (this.actor.hasHost()) {
            ui.notifications?.info(game.i18n.localize('SR5.Infos.CantModifyHostContent'));
            return;
        }

        const uuid = $(event.target).closest('a').data().itemId;
        if (!uuid) return;

        const markedDocument = await ActorMarksFlow.getMarkedDocument(uuid);
        if (!markedDocument) return;

        await this.actor.setMarks(markedDocument, -1);
    }

    static async #deleteMarks(this: SR5MatrixActorSheet, event) {
        event.stopPropagation();

        if (this.actor.hasHost()) {
            ui.notifications?.info(game.i18n.localize('SR5.Infos.CantModifyHostContent'));
            return;
        }

        const uuid = $(event.target).closest('a').data().itemId;
        if (!uuid) return;

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.actor.clearMark(uuid);
    }

    static async #clearAllMarks(this: SR5MatrixActorSheet, event) {
        event.stopPropagation();

        if (this.actor.hasHost()) {
            ui.notifications?.info(game.i18n.localize('SR5.Infos.CantModifyHostContent'));
            return;
        }

        const userConsented = await Helpers.confirmDeletion();
        if (!userConsented) return;

        await this.actor.clearMarks();
    }

    /**
     * When clicking on a specific mark, connect to the actor to this host/grid behind that.
     *
     * @param event Any interaction action
     */
    static async #connectToMarkedNetwork(this: SR5MatrixActorSheet, event) {
        event.stopPropagation();

        const uuid = $(event.target).closest('a').data().itemId;
        if (!uuid) return;

        const target = fromUuidSync(uuid) as SR5Item;
        if (!target || !(target instanceof SR5Item)) return;

        await this.actor.connectNetwork(target);
        this.render();
    }

    /**
     * When clicking on the disconnect button for the connected network, disconnect from it.
     * @param event Any interaction event.
     */
    static async #disconnectNetwork(this: SR5MatrixActorSheet, event) {
        event.stopPropagation();

        await this.actor.disconnectNetwork();
        this.render();
    }

}
