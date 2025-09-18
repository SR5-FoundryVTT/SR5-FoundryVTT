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
import { SR5ActiveEffect } from '@/module/effect/SR5ActiveEffect';


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
        data.matrixActions = await this._prepareMatrixActions();
        data.matrixLeftTabs = this._prepareTabs('matrixLeft');
        data.matrixRightTabs = this._prepareTabs('matrixRight');

        this._prepareMatrixTargets(data);
        this._prepareOwnedIcons(data);
        await this._prepareMarkedDocuments(data);
        this._prepareMatrixDevice(data);

        return data;
    }

    /*
    override activateListeners_LEGACY(html) {
        super.activateListeners_LEGACY(html);

        html.find('.show-matrix-network-hacking').click(this._onShowMatrixNetworkHacking.bind(this));
        html.find('.matrix-hacking-actions .item-roll').click(this._onRollMatrixAction.bind(this));

        html.find('.select-matrix-target').on('click', this._onSelectMatrixTarget.bind(this));
        html.find('.open-matrix-target').on('click', this._onOpenMarkedDocument.bind(this));
        html.find('.open-matrix-device').on('click', this._onOpenMatrixDevice.bind(this));

        html.find('.targets-refresh').on('click', this._onTargetsRefresh.bind(this));

        html.find('.setup-pan').on('click', this._addAllEquippedWirelessDevicesToPAN.bind(this));
        // Matrix Target - Connected Icons Visibility Switch
        html.find('.toggle-connected-matrix-icons').on('click', this._onToggleConnectedMatrixIcons.bind(this));

        // Matrix Network
        html.find('.connect-to-network').on('click', this._onConnectToMatrixNetwork.bind(this));

        html.find('.reboot-persona-device').on('click', this._onRebootPersonaDevice.bind(this));
        html.find('.matrix-toggle-running-silent').on('click', this._onMatrixToggleRunningSilent.bind(this));
        html.find('.toggle-owned-icon-silent').on('click', this._onOwnedIconRunningSilentToggle.bind(this));
    }

     */

    static override DEFAULT_OPTIONS: any = {
        actions: {
            toggleConnectedMatrixIcons: SR5MatrixActorSheet._onToggleConnectedMatrixIcons,
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
            template: this.templateBase('actor/tabs/matrix'),
        },
        matrixActions: {
            template: this.templateBase('actor/tabs/matrix/matrix-actions'),
            templates: this.listItem('action'),
        },
        markedIcons: {
            template: this.templateBase('actor/tabs/matrix/marked-icons'),
            templates: this.listItem('marked_icon'),
        },
        ownedIcons: {
            template: this.templateBase('actor/tabs/matrix/owned-icons'),
            templates: this.listItem('owned_icon'),
        },
        networkIcons: {
            template: this.templateBase('actor/tabs/matrix/network-icons'),
            templates: this.listItem('network_icon'),
        },
        programs: {
            template: this.templateBase('actor/tabs/matrix/programs'),
            templates: this.listItem('program'),
        }
    }

    override async _preparePartContext(partId, context, options): Promise<any> {
        const partContext = await super._preparePartContext(partId, context, options);

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

    static async _onOwnedIconRunningSilentToggle(this: SR5MatrixActorSheet, event) {
        event.preventDefault();
        event.stopPropagation();

        const iid = event.target?.dataset?.itemId;
        const document = await fromUuid(iid);
        if (!document) return;

        if (document instanceof SR5Actor) {
            // if the actor has a matrix device, change the wireless state there
            const device = document.getMatrixDevice();
            if (device) {
                // iterate through the states of online -> silent -> online
                const newState =  device.isRunningSilent() ? 'online' : 'silent';
                await this.actor.updateEmbeddedDocuments('Item', [
                    {
                        '_id': device._id,
                        system: { technology: { wireless: newState } }
                    }
                ])
            } else {
                // update the embedded item with the new wireless state
                await document.update({
                    system: { matrix: { running_silent: !document.isRunningSilent() } },
                });
                this.render();
            }
        } else if (document instanceof SR5Item) {
            // iterate through the states of online -> silent -> online
            const newState =  document.isRunningSilent() ? 'online' : 'silent';
            // update the embedded item with the new wireless state
            await document.update({ system: { technology: { wireless: newState } } });
            this.render();
        }
    }

    /**
     * Handle changing if an Actor is Running Silent
     * @param event
     * @private
     */
    private static  async _onMatrixToggleRunningSilent(this: SR5MatrixActorSheet, event) {
        event.preventDefault();
        event.stopPropagation();
        await MatrixSheetFlow.toggleRunningSilent(this.actor);
    }

    /**
     * Handle the user request to reboot their main active matrix device or living persona.
     * @param event Any pointer event
     */
    static async _onRebootPersonaDevice(this: SR5MatrixActorSheet,event: Event) {
        event.preventDefault();
        event.stopPropagation();
        await MatrixSheetFlow.promptRebootPersonaDevice(this.actor);
    }

    /**
     * Allow the user to select a matrix network to connect to.
     */
    static async _onConnectToMatrixNetwork(this: SR5MatrixActorSheet, event) {
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
    static async _onToggleConnectedMatrixIcons(this: SR5MatrixActorSheet, event) {
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
    async _addAllEquippedWirelessDevicesToPAN(event) {
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
    async _onShowMatrixNetworkHacking(event: Event) {
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
            const ownedItem = await this.actor.isOwnerOf(this.selectedMatrixTarget);
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
            const document = fromUuidSync(this.selectedMatrixTarget) as SR5Actor | SR5Item;
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
    static async _onOpenMatrixDevice(this: SR5MatrixActorSheet, event) {
        event.stopPropagation();

        const uuid = event.target.dataset.itemId;
        if (!uuid) return;

        // Marked documents can´t live in packs.
        const document = fromUuidSync(uuid) as SR5Item|SR5Actor;
        if (!document) return;

        await document.sheet?.render(true);
    }

    /**
     * Open a document from a DOM node containing a dataset uuid.
     *
     * This is intended to let deckers open marked documents they're FoundryVTT user has permissions for.
     *
     * @param event Any interaction event
     */
    static async _onOpenMarkedDocument(this: SR5MatrixActorSheet,event) {
        event.stopPropagation();

        const uuid = event.target.dataset.itemId;
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
    static async _onSelectMatrixTarget(this: SR5MatrixActorSheet, event) {
        event.stopPropagation();

        const uuid = event.target.dataset.itemId;
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
    static async _onTargetsRefresh(this: SR5MatrixActorSheet, event) {
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
}
