import { SR5Actor } from "../../actor/SR5Actor";
import { Helpers } from "../../helpers";
import { MatrixNetworkFlow } from "../../item/flows/MatrixNetworkFlow";
import { SR5Item } from "../../item/SR5Item";
import { BruteForceTest } from "../../tests/BruteForceTest";
import { HackOnTheFlyTest } from "../../tests/HackOnTheFlyTest";
import { TestCreator } from "../../tests/TestCreator";

/**
 * This application is used by users and gms to acquire targets for their matrix actions
 * from the point of view of a specific matrix user.
 */
// An atomic data point for a single matrix item
interface MatrixItemSheetData {
    item: SR5Item
    marks: number
}
// An atomic data point for a single matrix target, containing all matrix items within, used for display.
export interface MatrixTargetSheetData {
    // The targeted document.
    document: Shadowrun.NetworkDevice
    // Optional token for those documents having them.
    token: TokenDocument | null
    // Item icons conneceted to the target document
    matrixItems: MatrixItemSheetData[]

    marks: number
    // Indicates if the target is running silent.
    runningSilent: boolean
    // Shows the document name of the network the target is connected to.
    networkName: string
}

// Overall Sheet Data for this application.
interface MatrixTargetAcquisitionSheetData {
    placementActions: string[]
    targets: MatrixTargetSheetData[]
    personas: MatrixTargetSheetData[]
    ics: MatrixTargetSheetData[]
    devices: MatrixTargetSheetData[]
    hosts: SR5Item[]
    grids: SR5Item[]
    network: SR5Item|null
    hostNetwork: boolean
    gridNetwork: boolean
}

type MatrixPlacementTests = BruteForceTest | HackOnTheFlyTest;


/**
 * This application collects matrix items from tokens and actors visible to the matrix user based on shadowrun rules.
 * 
 * TODO: matrixItems and marks are collected but not used. Either remove or use them.
 */
export class MatrixTargetAcquisitionApplication extends Application {
    // The matrix user to be used for target acquisition.
    public actor: SR5Actor;

    constructor(actor: SR5Actor) {
        super();

        this.actor = actor;
    }

    override get template() {
        return 'systems/shadowrun5e/dist/templates/apps/matrix-target-acquisition/app.hbs';
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;

        options.classes = ['sr5']
        options.id = 'matrix-target-acquisition';
        options.title = game.i18n.localize('SR5.MatrixTargetAcquisitionApplication.Title');

        options.height = 'auto';
        options.resizable = true;

        options.tabs = [{
            navSelector: '.tabs[data-group="primary"]',
            contentSelector: '.tabsbody[data-group="primary"]',
            initial: 'targets'
        }]

        return options;
    }

    override activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html);

        html.find('.show-matrix-placement').on('click', this.handleMarkPlacement.bind(this));
    }

    override async getData(options?: Partial<ApplicationOptions> | undefined): Promise<MatrixTargetAcquisitionSheetData> {
        const data = await super.getData(options) as MatrixTargetAcquisitionSheetData;

        // Allow template to switch between network types.
        const network = this.actor.network;
        data.hostNetwork = network?.isHost ?? false;
        data.gridNetwork = network?.isGrid ?? false;
        data.network = network;

        // Prepare available networks for selection.
        data.grids = this.prepareMatrixGrids();
        data.hosts = this.prepareMatrixHosts();

        // Have an empty target list as fallback for failing network target collection.
        data.targets = [];

        // Collect target data based on network type.
        data.targets = network?.isHost ? 
            this.prepareMatrixHostTargets() : 
            this.prepareMatrixGridTargets();

        // Filter out invisible tokens.
        data.targets = data.targets.filter(target => !target.document || target.document.visible)

        const actors = data.targets.filter(target => target.document instanceof SR5Actor);
        const items = data.targets.filter(target => target.document instanceof SR5Item);

        // Filter personas from ic for better UI separation.
        data.personas = actors.filter(target => target.document.hasPersona);
        data.ics = actors.filter(target => target.document.isIC());
        data.devices = items.filter(target => !target.document);

        // TODO: Needed and used? Replaced by actor system data entry for it?
        data.placementActions = ['brute_force', 'hack_on_the_fly'];

        return data;
    }

    /**
     * If the active persona is looking at grid targets, collect all matrix icons
     * connected to grids or without any network connection.
     * 
     * This includes both scene tokens and matrix icons connected to any visible grid.
     */
    prepareMatrixGridTargets() {
        const targets: MatrixTargetSheetData[] = [];

        if (!canvas.scene?.tokens) return targets;

        // Collect all grid connected documents without scene tokens.
        for (const grid of MatrixNetworkFlow.getGrids({players: true})) {
            for (const slave of grid.slaves) {
                if (slave.getToken()) continue;
                
                targets.push({
                    document: slave,
                    token: null,
                    marks: this.actor.getMarksPlaced(slave.uuid),
                    matrixItems: this._prepareActorMatrixItems(slave),
                    runningSilent: slave.isRunningSilent,
                    networkName: grid.name || ''
                });
            }
        }

        // Collect all scene tokens.
        for (const token of canvas.scene?.tokens) {
            // Throw away unneeded tokens.
            if (!token.actor) continue;
            const target = token.actor;

            // Validate Foundry VTT visibility.
            if (target?.id === this.actor.id) continue;
            if (game.user?.isGM && token.hidden) continue;

            // Validate Shadowrun5e visibility.
            if (!target.hasPersona) continue;
            if (target.isIC()) continue;
            if (!this.actor.matrixPersonaIsVisible(target)) continue;

            targets.push({
                document: token.actor,
                token,
                marks: this.actor.getMarksPlaced(token.actor.uuid),
                matrixItems: this._prepareActorMatrixItems(token.actor),
                runningSilent: token.actor.isRunningSilent,
                networkName: token.actor.network?.name ?? ''
            })
        }

        // Sort all targets by grid name first and target name second.
        targets.sort((a, b) => {
            const gridNameA = a.networkName.toLowerCase();
            const gridNameB = b.networkName.toLowerCase();
            const nameA = a.document.name.toLowerCase();
            const nameB = b.document.name.toLowerCase();

            if (gridNameA < gridNameB) return -1;
            if (gridNameA > gridNameB) return 1;
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

        return targets;
    }

    /**
     * Collect all personas and devices connected to the current host network.
     */
    prepareMatrixHostTargets() {
        const host = this.actor.network;
        if (!host?.isHost) {
            console.error('Shadowrun 5e | Actor is not connected to a host network');
            return [];
        }

        const targets: MatrixTargetSheetData[] = []

        for (const slave of host.slaves) {
            targets.push({
                document: slave,
                token: slave.getToken(),
                marks: this.actor.getMarksPlaced(slave.uuid),
                matrixItems: this._prepareActorMatrixItems(slave),
                runningSilent: slave.isRunningSilent,
                networkName: host.name || ''
            });
        }

        for (const ic of host.getIC()) {
            targets.push({
                document: ic,
                token: ic.getToken(),
                marks: this.actor.getMarksPlaced(ic.uuid),
                matrixItems: [],
                runningSilent: ic.isRunningSilent,
                networkName: host.name || ''
            })
        }

        return targets;
    }

    /**
     * Prepare items on the given document having matrix icons.
     *
     * @param document Any network document.
     */
    _prepareActorMatrixItems(document: Shadowrun.NetworkDevice) {
        if (!(document instanceof SR5Actor)) return [];

        const matrixItems: MatrixItemSheetData[] = [];

        for (const item of document.items) {
            if (!item.isMatrixItem) continue;
            const marks = this.actor.getMarksPlaced(item.uuid);

            matrixItems.push({
                item, marks
            });
        }

        return matrixItems;
    }

    /**
     * Collect all hosts for selection.
     */
    prepareMatrixHosts() {
        return game.items?.filter(item => item.isHost && item.matrixIconVisibleToPlayer) ?? [];
    }

    /**
     * Collect all grids for selection.
     */
    prepareMatrixGrids() {
        return game.items?.filter(item => item.isGrid && item.matrixIconVisibleToPlayer) ?? [];
    }

    /**
     * Trigger Mark Placement for selected target document.
     *
     * @param event A event triggered from within a Handble ListItem
     */
    async handleMarkPlacement(event) {
        event.preventDefault();
        event.stopPropagation();

        const targetUuid = Helpers.listItemId(event);
        if (!targetUuid) return;

        const target = await fromUuid(targetUuid) as Shadowrun.NetworkDevice;
        if (!target) {
            console.error('Shadowrun 5e | Could not find target with uuid', targetUuid);
            return;
        }

        // Get default mark placement action.
        const character = this.actor.asCharacter();
        if (!character) return;
        const markPlacementAction = character.system.matrix.markPlacementAction;
        if (!markPlacementAction) return;

        // Get test for that action.
        const test = await TestCreator.fromPackAction('matrix-actions', markPlacementAction, this.actor) as MatrixPlacementTests;
        if (!test) return;

        this.close();

        // Prepare test for placing a mark on the target.
        // test.data.iconUuid = targetUuid;
        test.addTarget(target);
        await test.execute();
    }
}
