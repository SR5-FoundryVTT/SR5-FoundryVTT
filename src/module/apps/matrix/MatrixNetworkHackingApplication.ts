import { SR5Actor } from "../../actor/SR5Actor";
import { SR5 } from "../../config";
import { MatrixFlow } from "../../flows/MatrixFlow";
import { Helpers } from "../../helpers";
import { MatrixNetworkFlow } from "../../item/flows/MatrixNetworkFlow";
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
}

type MatrixPlacementTests = BruteForceTest | HackOnTheFlyTest;


/**
 * This application collects all visible matrix networks for players to connect.
 * 
 */
export class MatrixNetworkHackingApplication extends Application {
    // Actor used to retrieve the matrix persona.
    public actor: SR5Actor;

    /**
     * @param actor Actor to place marks with.
     */
    constructor(actor: SR5Actor) {
        super();

        this.actor = actor;
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

        html.find('.matrix-network-invite').on('click', this.handleMarkInvite.bind(this));
        html.find('.matrix-network-bruteforce').on('click', this.handleBruteForce.bind(this));
        html.find('.matrix-network-hackonthefly').on('click', this.handleHackOnTheFly.bind(this));
    }

    override async getData(options?: Partial<Application.Options> | undefined): Promise<MatrixNetworkHackingSheetData> {
        const data = await super.getData(options) as MatrixNetworkHackingSheetData;

        data.config = SR5;

        // Prepare available networks for selection.
        data.grids = MatrixFlow.visibleGrids();
        data.hosts = MatrixFlow.visibelHosts();

        return data;
    }

    /**
     * Execute the chosen mark placement action test.
     */
    async executeMarkPlacementActionTest(targetUuid: string, action: string) {
        const target = await fromUuid(targetUuid) as SR5Actor | SR5Item;
        if (!target) {
            console.error('Shadowrun 5e | Could not find target with uuid', targetUuid);
            return;
        }

        // Get test for that action.
        const matrixPackName = Helpers.getMatrixActionsPackName();
        const test = await TestCreator.fromPackAction(matrixPackName, action, this.actor) as MatrixPlacementTests;
        if (!test) return;

        this.close();

        // Prepare test for placing a mark on the target.
        // test.data.iconUuid = targetUuid;
        test.addTarget(target);
        await test.execute();
    }

    /**
     * User triggered placing mark by Brute Force. Execute the matching test action.
     * 
     * @param event User clicked on something.
     */
    async handleBruteForce(event) {
        event.preventDefault();
        event.stopPropagation();

        const targetUuid = Helpers.listItemUuid(event);
        if (!targetUuid) return;
        const action = "Brute Force";

        await this.executeMarkPlacementActionTest(targetUuid, action);
    }

    /**
     * User triggered placing mark by Hack on The Fly. Execute the matching test action.
     * 
     * @param event User clicked on something.
     */
    async handleHackOnTheFly(event) {
        event.preventDefault();
        event.stopPropagation();

        const targetUuid = Helpers.listItemUuid(event);
        if (!targetUuid) return;
        const action = "Hack on The Fly";

        await this.executeMarkPlacementActionTest(targetUuid, action);
    }

    /**
     * User asks network for an voluntary mark.
     * 
     * @param event User triggered event.
     */
    async handleMarkInvite(event) { 
        event.preventDefault();
        event.stopPropagation();

        const uuid = Helpers.listItemUuid(event);
        if(!uuid) return;

        const network = fromUuidSync(uuid) as SR5Item | null;
        if (!network) return;

        await MatrixNetworkFlow.AskForNetworkMarkInvite(this.actor, network);
    }
}
