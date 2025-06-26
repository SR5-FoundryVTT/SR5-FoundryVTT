import { SR5Actor } from "../../actor/SR5Actor";
import { SR5 } from "../../config";
import { MatrixFlow } from "../../flows/MatrixFlow";
import { Helpers } from "../../helpers";
import { SR5Item } from "../../item/SR5Item";
import { BruteForceTest } from "../../tests/BruteForceTest";
import { HackOnTheFlyTest } from "../../tests/HackOnTheFlyTest";
import { TestCreator } from "../../tests/TestCreator";

// Overall Sheet Data for this application.
interface MatrixNetworkHackingSheetData {
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
 * This application collects all visible matrix networks for players to connect.
 * 
 */
export class MatrixNetworkHackingApplication extends Application {
    // Actor used to retrieve the matrix persona.
    public actor: SR5Actor;
    // Action used to place mark.
    markPlacementAction: string;

    constructor(actor: SR5Actor) {
        super();

        this.actor = actor;
        const character = this.actor.asCharacter();
        this.markPlacementAction = character?.system.matrix.markPlacementAction ?? 'Brute Force';
    }

    override get template() {
        return 'systems/shadowrun5e/dist/templates/apps/matrix-network-hacking/app.hbs';
    }

    static override get defaultOptions() {
        const options = super.defaultOptions;

        options.classes = ['sr5']
        options.id = 'matrix-net-acquisition';
        options.title = game.i18n.localize('SR5.MatrixNetworkHackingApplication.Title');

        options.height = 'auto';
        options.resizable = true;

        options.tabs = [{
            navSelector: '.tabs[data-group="primary"]',
            contentSelector: '.tabsbody[data-group="primary"]',
            initial: 'networks'
        }]

        return options;
    }

    override activateListeners(html: JQuery<HTMLElement>): void {
        super.activateListeners(html);

        html.find('.show-matrix-placement').on('click', this.handleMarkPlacement.bind(this));
        html.find('#mark-placement-action').on('click', this.handlePlacementAction.bind(this));
    }

    override async getData(options?: Partial<ApplicationOptions> | undefined): Promise<MatrixNetworkHackingSheetData> {
        const data = await super.getData(options) as MatrixNetworkHackingSheetData;

        data.config = SR5;

        const character = this.actor.asCharacter();

        // Prepare available networks for selection.
        data.grids = MatrixFlow.visibleGrids();
        data.hosts = MatrixFlow.visibelHosts();

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
