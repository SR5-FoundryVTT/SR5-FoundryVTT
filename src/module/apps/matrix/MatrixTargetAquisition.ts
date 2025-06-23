import { SR5Actor } from "../../actor/SR5Actor";
import { SR5 } from "../../config";
import { MatrixFlow } from "../../flows/MatrixFlow";
import { Helpers } from "../../helpers";
import { SR5Item } from "../../item/SR5Item";
import { BruteForceTest } from "../../tests/BruteForceTest";
import { HackOnTheFlyTest } from "../../tests/HackOnTheFlyTest";
import { TestCreator } from "../../tests/TestCreator";

// Overall Sheet Data for this application.
interface MatrixTargetAcquisitionSheetData {
    targets: Shadowrun.MatrixTargetDocument[]
    personas: Shadowrun.MatrixTargetDocument[]
    ics: Shadowrun.MatrixTargetDocument[]
    devices: Shadowrun.MatrixTargetDocument[]
    hosts: SR5Item[]
    grids: SR5Item[]
    network: SR5Item|null
    hostNetwork: boolean
    gridNetwork: boolean
    config: typeof SR5
    // Currently selected mark placement action.
    // Used for select option
    markPlacementAction: string
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
    markPlacementAction: string;

    constructor(actor: SR5Actor) {
        super();

        this.actor = actor;
        const character = this.actor.asCharacter();
        this.markPlacementAction = character?.system.matrix.markPlacementAction ?? 'Brute Force';
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
        html.find('#mark-placement-action').on('click', this.handlePlacementAction.bind(this));
    }

    override async getData(options?: Partial<ApplicationOptions> | undefined): Promise<MatrixTargetAcquisitionSheetData> {
        const data = await super.getData(options) as MatrixTargetAcquisitionSheetData;

        data.config = SR5;

        const character = this.actor.asCharacter();

        // Allow template to switch between network types.
        const network = this.actor.network;
        data.hostNetwork = network?.isHost ?? false;
        data.gridNetwork = network?.isGrid ?? false;
        data.network = network;

        // Prepare available networks for selection.
        data.grids = MatrixFlow.visibleGrids();
        data.hosts = MatrixFlow.visibelHosts();

        // Have an empty target list as fallback for failing network target collection.
        data.targets = [];

        // Collect target data based on network type.
        data.targets = network?.isHost ? 
            MatrixFlow.prepareHostTargets(this.actor) :
            MatrixFlow.prepareGridTargets(this.actor);

        // Filter out invisible tokens.
        data.targets = data.targets.filter(target => !target.document || target.document.visible)

        const actors = data.targets.filter(target => target.document instanceof SR5Actor);
        const items = data.targets.filter(target => target.document instanceof SR5Item);

        // Filter personas from ic for better UI separation.
        data.personas = actors.filter(target => target.document.hasPersona);
        data.ics = actors.filter(target => target.document.isIC());
        data.devices = items.filter(target => !target.document);

        data.markPlacementAction = character?.system.matrix.markPlacementAction ?? 'brute_force';

        return data;
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

        if (!this.markPlacementAction) {
            console.error('Shadowrun 5e | No mark placement action selected.');
            return;
        };

        // Get test for that action.
        const test = await TestCreator.fromPackAction('matrix-actions', this.markPlacementAction, this.actor) as MatrixPlacementTests;
        if (!test) return;

        await this.actor.update({'system.matrix.markPlacementAction': this.markPlacementAction });
        this.close();

        // Prepare test for placing a mark on the target.
        // test.data.iconUuid = targetUuid;
        test.addTarget(target);
        await test.execute();
    }

    /**
     * Trigger changes when selecting a different placment action.
     * 
     * This app is not a document sheet, so we store the value temporarily in the application instance.
     * 
     * @param event Triggered 
     */
    async handlePlacementAction(event) {
        event.stopPropagation();

        const select = event.currentTarget as HTMLSelectElement;
        this.markPlacementAction = select.value;
    }
}
