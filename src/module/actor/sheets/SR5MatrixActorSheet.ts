import { MatrixNetworkHackingApplication } from '../../apps/matrix/MatrixNetworkHackingApplication';
import { SR5BaseActorSheet } from "./SR5BaseActorSheet";
import { Helpers } from "../../helpers";
import { SR5Item } from '../../item/SR5Item';
import { FormDialog } from '../../apps/dialogs/FormDialog';
import { SR5Actor } from '../SR5Actor';
import { MatrixFlow } from '../../flows/MatrixFlow';
import { ActorMarksFlow } from '../flows/ActorMarksFlow';
import SR5ActorSheetData = Shadowrun.SR5ActorSheetData;
import { SelectMatrixNetworkDialog } from '@/module/apps/dialogs/SelectMatrixNetworkDialog';


export interface MatrixActorSheetData extends SR5ActorSheetData {
    markedDocuments: Shadowrun.MarkedDocument[]
    handledItemTypes: string[]
    network: SR5Item | null
    matrixActions: SR5Item[]
    selectedMatrixTarget: string|undefined
    // Stores icons connected to the selected matrix target.
    selectedMatrixTargetIcons: Shadowrun.MatrixTargetDocument[];
    // Targets to be displayed in the matrix tab.
    matrixTargets: Shadowrun.MatrixTargetDocument[]
}

export class SR5MatrixActorSheet extends SR5BaseActorSheet {
    // Stores which document has been selected in the matrix tab.
    // We accept this selection to not be persistant across Foundry sessions.
    selectedMatrixTarget: string|undefined;

    static override get defaultOptions() {
        const defaultOptions = super.defaultOptions;
        return foundry.utils.mergeObject(defaultOptions, {
            tabs: [...defaultOptions.tabs,
                {
                    navSelector: '.tabs[data-group="matrix"]',
                    contentSelector: '.tabsbody[data-group="matrix"]',
                    initial: 'marks',
                }]
        });
    }

    override async getData(options): Promise<any> {
        const data = await super.getData(options) as MatrixActorSheetData;

        data.network = this.actor.network;
        data.matrixActions = await this.getMatrixActions();


        this._prepareMatrixTargets(data);
        await this._prepareMarkedDocuments(data);

        return data;
    }

    _prepareMatrixTargets(data: MatrixActorSheetData) {
        data.selectedMatrixTarget = this.selectedMatrixTarget;

        // When target overview is shown, collect all matrix targets.
        // TODO: taMiF this is a bis of a mess and will need to be reusable across both targets and marked docs and different actor types.
        const {targets} = MatrixFlow.getMatrixTargets(this.actor);

        for (const target of targets) {
            // Collect connected icons, if user wants to see them.
            if (this._connectedIconsOpenClose[target.document.uuid]) {
                target.icons = MatrixFlow.getConnectedMatrixIconTargets(target.document as SR5Actor);

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

    async _prepareMarkedDocuments(data: MatrixActorSheetData) {
        // When marked documents overview is shown, collect all marked documents.
        const markedDocuments = await this.actor.getAllMarkedDocuments();
        data.markedDocuments = this._prepareMarkedDocumentTargets(markedDocuments);
    }

    override activateListeners(html) {
        super.activateListeners(html);

        html.find('.show-matrix-network-hacking').click(this._onShowMatrixNetworkHacking.bind(this));
        html.find('.matrix-hacking-actions .item-roll').click(this._onRollMatrixAction.bind(this));

        html.find('.select-matrix-target').on('click', this._onSelectMatrixTarget.bind(this));
        html.find('.open-matrix-target').on('click', this._onOpenMarkedDocument.bind(this));
        html.find('.open-matrix-device').on('click', this._onOpenMatrixDevice.bind(this));

        html.find('.targets-refresh').on('click', this._onTargetsRefresh.bind(this));

        html.find('.setup-pan').on('click', this._addAllEquippedWirelessDevicesToPAN.bind(this));

        // Matrix Network
        html.find('.connect-to-network').on('click', this._onConnectToMatrixNetwork.bind(this));
        // Matrix Target - Connected Icons Visibility Switch
        html.find('.toggle-connected-matrix-icons').on('click', this._onToggleConnectedMatrixIcons.bind(this));
    }

    /**
     * Allow the user to select a matrix network to connect to.
     */
    async _onConnectToMatrixNetwork(event) {
        event.stopPropagation();

        const dialog = new SelectMatrixNetworkDialog(this.document);
        const network = await dialog.select();
        if (dialog.canceled) return;

        await this.document.connectNetwork(network);
        this.render();
    }

    /**
     * Within the list of avialable matrix targets, toggle visibility of sub-sections for connected icons
     * for a single matrix target.
     *
     * This is done by clicking on a specific icon by user input and will trigger:
     * - switching out sheet display
     * - provide a display of additional matrix icons underneath uuid
     */
    async _onToggleConnectedMatrixIcons(event) {
        event.stopPropagation();

        const uuid = Helpers.listItemUuid(event);
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
            const progressBar = ui.notifications.info(game.i18n.localize("SR5.AddDevicesToPAN.Starting"), { progress: true });
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
                await item.disconnectFromNetwork();
                progressBar.update({
                    pct: i / total,
                    message: `(${i}/${total}) ${game.i18n.localize(`SR5.AddDevicesToPAN.Adding`)} ${item.name} `
                })
                await matrixDevice.addSlave(item);
            }
            progressBar.remove();
            ui.notifications.info(game.i18n.localize(`SR5.AddDevicesToPAN.FinishedAddingItems`));
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
        let actions = [...packActions, ...actorActions] as SR5Item<'action'>[];

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
    async _onOpenMatrixDevice(event) {
        event.stopPropagation();

        const uuid = Helpers.eventUuid(event);
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
    async _onOpenMarkedDocument(event) {
        event.stopPropagation();

        const uuid = Helpers.listItemUuid(event)
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

                // TODO: taM check this
                target.icons = MatrixFlow.getConnectedMatrixIconTargets(target.document as SR5Actor);

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
