import { SR5Actor } from "../../actor/SR5Actor";
import { Helpers } from "../../helpers";
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
interface MatrixTargetSheetData {
    actor?: SR5Actor
    item?: SR5Item
    marks: number
    matrixItems: MatrixItemSheetData[]
    // Indicates if the target is running silent.
    runningSilent: boolean
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
    network: SR5Item|undefined
    hostNetwork: boolean
    gridNetwork: boolean
}

type MatrixPlacementTests = BruteForceTest | HackOnTheFlyTest;


/**
 * This application collects matrix items from tokens and actors visible to the matrix user based on shadowrun rules.
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

        // Collect target data based on network type.
        // TODO: a decker without host or grid is still 'in the grid' and should see personas / devices across grids
        if (network?.isHost) {
            data.targets = this.prepareMatrixHostTargets();
        }
        else if (network?.isGrid) {
            data.targets = this.prepareMatrixGridTargets();
        }

        // Filter out invisible tokens.
        // TODO: Improve matrix and foundry visibility handling.
        data.targets = data.targets.filter(target => !target.actor || target.actor.visible)
        // Filter personas from ic for better UI separation.
        data.personas = data.targets.filter(target => target.actor?.hasPersona && !target.actor?.isIC());
        data.ics = data.targets.filter(target => target.actor?.isIC());
        data.devices = data.targets.filter(target => !target.actor);

        // TODO: Needed and used? Replaced by actor system data entry for it?
        data.placementActions = ['brute_force', 'hack_on_the_fly'];

        return data;
    }

    /**
     * Collect all personas and devices connected to grids.
     */
    prepareMatrixGridTargets() {
        const targets: MatrixTargetSheetData[] = [];

        if (!canvas.scene?.tokens) return targets;

        for (const token of canvas.scene?.tokens) {
            // Throw away unneeded tokens.
            if (!token.actor) continue;
            const target = token.actor;
            // Skip the deckers token.
            if (target?.id === this.actor.id) continue;
            // Skip based on FoundryVTT details.
            if (game.user?.isGM && token.hidden) continue;
            // Skip actors based on their persona and visibility.
            if (!target.hasPersona) continue;
            if (!this.actor.matrixPersonaIsVisible(target)) continue;

            // Collect matrix items from each token
            const matrixItems: MatrixItemSheetData[] = [];

            for (const item of token.actor.items) {
                if (!item.isMatrixItem) continue;
                const marks = this.actor.getMarksPlaced(item.uuid);

                matrixItems.push({
                    item, marks
                });
            }

            targets.push({
                actor: token.actor,
                marks: this.actor.getMarksPlaced(token.actor.uuid),
                matrixItems,
                runningSilent: false
            })
        }

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

        for (const slave of host.slaves()) {
            targets.push({
                item: slave,
                marks: this.actor.getMarksPlaced(slave.uuid),
                matrixItems: [],
                runningSilent: false
            });
        }

        for (const ic of host.getIC()) {
            targets.push({
                actor: ic,
                marks: this.actor.getMarksPlaced(ic.uuid),
                matrixItems: [],
                runningSilent: false
            })
        }

        return targets;
    }

    /**
     * Collect all hosts for selection.
     */
    prepareMatrixHosts() {
        return game.items?.filter(item => item.isHost && item.isMatrixPlayerVisible) ?? [];
    }

    /**
     * Collect all grids for selection.
     */
    prepareMatrixGrids() {
        return game.items?.filter(item => item.isGrid && item.isMatrixPlayerVisible) ?? [];
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